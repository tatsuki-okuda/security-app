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

        const existingQuestions = await tx.quizQuestion.findMany({
          where: { drillId },
          select: { id: true },
        });

        if (existingQuestions.length > 0) {
          const questionIds = existingQuestions.map((q) => q.id);

          // 回答履歴がある場合は関連制約エラーになるため、先に回答内容を削除する
          await tx.quizAnswer.deleteMany({
            where: {
              questionId: { in: questionIds },
            },
          });

          await tx.quizOption.deleteMany({
            where: {
              questionId: { in: questionIds },
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

      let parsedUserIds: string[] = [];
      if (Array.isArray(targetUserIds)) {
        parsedUserIds = targetUserIds;
      } else if (typeof targetUserIds === 'string') {
        try {
          const current: unknown = targetUserIds;
          // 二重、三重に stringify されたり、エスケープ文字が混入しているケースへの対応
          let parsedValue: unknown = current;
          
          while (typeof parsedValue === 'string') {
            try {
              // 単純な parse
              const nextValue = JSON.parse(parsedValue);
              if (parsedValue === nextValue) {
                  break; // 変化がなければ抜ける
              }
              parsedValue = nextValue;
            } catch {
              // JSON.parse に失敗した場合（余計なエスケープ文字が残っている場合など）
              // 余分なバックスラッシュや前後についた不要なダブルクォーテーションを綺麗にする
              const strValue = parsedValue as string;
              const cleaned = strValue
                .replace(/^"+|"+$/g, '')          // 前後の " を削除 (e.g. "\"[\"foo\"]\"" -> \[\"foo\"\] )
                .replace(/\\"/g, '"')             // \" を " に変換
                .replace(/\\\\/g, '\\');          // \\ を \ に変換

              if (cleaned !== strValue && (cleaned.startsWith('[') || cleaned.startsWith('"'))) {
                parsedValue = cleaned;
              } else {
                 break; // これ以上綺麗にできない・パースできなければ諦める
              }
            }
          }

          if (Array.isArray(parsedValue)) {
             parsedUserIds = parsedValue as string[];
          } else if (typeof parsedValue === 'string' && parsedValue.includes(',')) {
              // 万が一カンマ区切りの文字列になっていた場合のフォールバック
             parsedUserIds = parsedValue.split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
          } else if (typeof parsedValue === 'string') {
              // 単一の ID 文字列のフォールバック
             parsedUserIds = [parsedValue.trim().replace(/^"|"$/g, '')].filter(Boolean);
          }
        } catch {
          // do nothing string parse failed
        }
      }

      if (targetType === 'specific' && parsedUserIds.length > 0) {
        whereClause.id = { in: parsedUserIds };
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
