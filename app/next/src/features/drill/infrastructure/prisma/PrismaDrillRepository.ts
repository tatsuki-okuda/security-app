import { randomUUID } from 'crypto';

import { prisma } from '@/prismaClient';

import { err, ok } from '../../../../shared/fp/result';
import { DrillRepository } from '../../usecases/gateway/DrillRepository';

export const createPrismaDrillRepository = (): DrillRepository => ({
  createDrillWithQuiz: async ({ title, scenarioType, channel, targetType, targetCount, targetUserIds, subject, body, guidanceText, status, quiz }) => {
    try {
      const drill = await prisma.$transaction(async (tx) => {
        const created = await tx.drill.create({
          data: {
            title,
            scenarioId: scenarioType,
            status,
            channel,
            targetType,
            targetCount,
            targetUserIds: targetUserIds ? JSON.stringify(targetUserIds) : null,
            subject,
            body,
            guidanceText,
          },
          select: { id: true },
        });

        for (const question of quiz) {
          const createdQuestion = await tx.quizQuestion.create({
            data: {
              drillId: created.id,
              order: question.order,
              questionType: question.questionType,
              questionText: question.questionText,
              explanation: question.explanation,
            },
            select: { id: true },
          });

          await tx.quizOption.createMany({
            data: question.options.map((option) => ({
              questionId: createdQuestion.id,
              label: option.label,
              optionText: option.optionText,
              isCorrect: option.isCorrect,
            })),
          });
        }

        return created;
      });

      return ok({ drillId: drill.id });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  updateDrillWithQuiz: async ({ drillId, channel, targetType, targetCount, targetUserIds, subject, body, guidanceText, status, quiz }) => {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.drill.update({
          where: { id: drillId },
          data: {
            status,
            channel,
            targetType,
            targetCount,
            targetUserIds: targetUserIds ? JSON.stringify(targetUserIds) : null,
            subject,
            body,
            guidanceText,
          },
        });

        // 既存のクイズをすべて削除（オプションは連携削除設定されていないため明示的に削除する）
        const existingQuestions = await tx.quizQuestion.findMany({
          where: { drillId },
          select: { id: true },
        });

        if (existingQuestions.length > 0) {
          await tx.quizOption.deleteMany({
            where: {
              questionId: { in: existingQuestions.map((q) => q.id) },
            },
          });
        }

        await tx.quizQuestion.deleteMany({
          where: { drillId },
        });

        for (const question of quiz) {
          const createdQuestion = await tx.quizQuestion.create({
            data: {
              drillId,
              order: question.order,
              questionType: question.questionType,
              questionText: question.questionText,
              explanation: question.explanation,
            },
            select: { id: true },
          });

          await tx.quizOption.createMany({
            data: question.options.map((option) => ({
              questionId: createdQuestion.id,
              label: option.label,
              optionText: option.optionText,
              isCorrect: option.isCorrect,
            })),
          });
        }
      });

      return ok(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  listDeliveryTargets: async ({ targetType, targetCount, targetUserIds }) => {
    try {
      const whereClause: import('@prisma/client').Prisma.UserWhereInput = {
        consentedAt: { not: null },
        optedOut: false,
      };

      if (targetType === 'specific' && targetUserIds && targetUserIds.length > 0) {
        whereClause.id = { in: targetUserIds };
      }

      let users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          slackUserId: true,
        },
      });

      if (targetType === 'random' && targetCount && targetCount > 0) {
        // Simple random sampling for MVP
        users = users.sort(() => 0.5 - Math.random()).slice(0, targetCount);
      }

      return ok(
        users.map((u) => ({
          userId: u.id,
          email: u.email,
          slackUserId: u.slackUserId,
        })),
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  getDrillDetail: async (drillId) => {
    try {
      const drill = await prisma.drill.findUnique({
        where: { id: drillId },
      });
      return ok(drill);
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  ensureDeliveryChannels: async () => {
    try {
      const [emailChannel, slackChannel] = await prisma.$transaction([
        prisma.deliveryChannel.upsert({
          where: { code: 'email' },
          update: { name: 'メール' },
          create: { code: 'email', name: 'メール' },
          select: { id: true },
        }),
        prisma.deliveryChannel.upsert({
          where: { code: 'slack' },
          update: { name: 'Slack' },
          create: { code: 'slack', name: 'Slack' },
          select: { id: true },
        }),
      ]);

      return ok({ emailChannelId: emailChannel.id, slackChannelId: slackChannel.id });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  createRecipientsAndTokens: async ({ drillId, targets, channel, emailChannelId, slackChannelId }) => {
    try {
      const recipients: Array<{
        drillRecipientId: string;
        channel: 'email' | 'slack';
        email: string | null;
        slackUserId: string | null;
        token: string;
        userId: string;
      }> = [];

      await prisma.$transaction(async (tx) => {
        for (const target of targets) {
          if ((channel === 'email' || channel === 'both') && target.email) {
            const recipient = await tx.drillRecipient.upsert({
              where: {
                drillId_userId_deliveryChannelId: {
                  drillId,
                  userId: target.userId,
                  deliveryChannelId: emailChannelId,
                },
              },
              update: {
                deliveryStatus: 'pending',
                deliveryError: null,
                deliveredAt: null,
              },
              create: {
                drillId,
                userId: target.userId,
                deliveryChannelId: emailChannelId,
                deliveryStatus: 'pending',
              },
              select: { id: true },
            });

            const token = randomUUID();
            await tx.trackingToken.create({
              data: {
                drillId,
                drillRecipientId: recipient.id,
                token,
              },
            });

            recipients.push({
              drillRecipientId: recipient.id,
              channel: 'email',
              email: target.email,
              slackUserId: null,
              token,
              userId: target.userId,
            });
          }

          if ((channel === 'slack' || channel === 'both') && target.slackUserId) {
            const recipient = await tx.drillRecipient.upsert({
              where: {
                drillId_userId_deliveryChannelId: {
                  drillId,
                  userId: target.userId,
                  deliveryChannelId: slackChannelId,
                },
              },
              update: {
                deliveryStatus: 'pending',
                deliveryError: null,
                deliveredAt: null,
              },
              create: {
                drillId,
                userId: target.userId,
                deliveryChannelId: slackChannelId,
                deliveryStatus: 'pending',
              },
              select: { id: true },
            });

            const token = randomUUID();
            await tx.trackingToken.create({
              data: {
                drillId,
                drillRecipientId: recipient.id,
                token,
              },
            });

            recipients.push({
              drillRecipientId: recipient.id,
              channel: 'slack',
              email: null,
              slackUserId: target.slackUserId,
              token,
              userId: target.userId,
            });
          }
        }
      });

      return ok(recipients);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  markRecipientDelivered: async ({ drillRecipientId, error }) => {
    try {
      await prisma.drillRecipient.update({
        where: { id: drillRecipientId },
        data: {
          deliveryStatus: error ? 'failed' : 'sent',
          deliveryError: error ?? null,
          deliveredAt: new Date(),
        },
      });
      return ok(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  updateDrillStatus: async ({ drillId, status }) => {
    try {
      await prisma.drill.update({
        where: { id: drillId },
        data: { status, sentAt: status === 'sent' ? new Date() : undefined },
      });
      return ok(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  recordSendInteraction: async ({ drillId, userId }) => {
    try {
      await prisma.interaction.create({
        data: {
          drillId,
          userId,
          type: 'send',
        },
      });
      return ok(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
});
