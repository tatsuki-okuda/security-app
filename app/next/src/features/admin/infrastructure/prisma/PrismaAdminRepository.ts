import { prisma } from '@/prismaClient';

import { err, ok } from '../../../../shared/fp/result';

import type { AdminRepository } from '../../usecases/gateway/AdminRepository';

export const createPrismaAdminRepository = (): AdminRepository => ({
  listUsers: async () => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          optedOut: true,
          drillRecipients: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { clickedAt: true, learnedAt: true },
          },
          quizAttempts: {
            orderBy: { submittedAt: 'desc' },
            take: 1,
            select: { isPassed: true },
          },
        },
      });

      const mapped = users.map((user) => {
        const latestRecipient = user.drillRecipients[0];
        const latestAttempt = user.quizAttempts[0];

        let latestStatus = '未送信';
        if (latestRecipient) {
          if (latestAttempt?.isPassed) {
            latestStatus = '合格';
          } else if (latestRecipient.clickedAt) {
            latestStatus = '未学習';
          } else {
            latestStatus = '未送信';
          }
        }

        return {
          id: user.id,
          email: user.email,
          optedOut: user.optedOut,
          latestStatus,
        };
      });

      return ok(mapped);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  getUserDetail: async (userId) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          slackUserId: true,
          optedOut: true,
        },
      });

      if (!user) return ok(null);

      const recipients = await prisma.drillRecipient.findMany({
        where: { userId },
        include: {
          drill: { select: { id: true, title: true, sentAt: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const attempts = await prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
        select: { drillId: true, score: true, isPassed: true },
      });

      const attemptMap = new Map<string, { score: number; isPassed: boolean }>();
      for (const attempt of attempts) {
        if (!attemptMap.has(attempt.drillId)) {
          attemptMap.set(attempt.drillId, { score: attempt.score, isPassed: attempt.isPassed });
        }
      }

      const drills = recipients.map((recipient) => {
        const attempt = attemptMap.get(recipient.drillId) ?? null;
        return {
          drillId: recipient.drill.id,
          title: recipient.drill.title,
          sentAt: recipient.drill.sentAt,
          clickedAt: recipient.clickedAt,
          learnedAt: recipient.learnedAt,
          latestScore: attempt?.score ?? null,
          passed: attempt?.isPassed ?? null,
        };
      });

      return ok({
        id: user.id,
        email: user.email,
        slackUserId: user.slackUserId,
        optedOut: user.optedOut,
        drills,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  listDrills: async () => {
    try {
      const drills = await prisma.drill.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          status: true,
          channel: true,
          sentAt: true,
          _count: { select: { drillRecipients: true } },
        },
      });

      const mapped = await Promise.all(
        drills.map(async (drill) => {
          const clickCount = await prisma.interaction.count({
            where: { drillId: drill.id, type: 'click' },
          });
          const passCount = await prisma.quizAttempt.count({
            where: { drillId: drill.id, isPassed: true },
          });

          return {
            id: drill.id,
            title: drill.title,
            status: drill.status,
            channel: drill.channel,
            sentAt: drill.sentAt,
            recipientCount: drill._count.drillRecipients,
            clickCount,
            passCount,
          };
        }),
      );

      return ok(mapped);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  getDrillDetail: async (drillId) => {
    try {
      const drill = await prisma.drill.findUnique({
        where: { id: drillId },
        select: {
          id: true,
          title: true,
          status: true,
          channel: true,
          subject: true,
          body: true,
          guidanceText: true,
          sentAt: true,
          quizQuestions: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              questionText: true,
              questionType: true,
              explanation: true,
              options: {
                orderBy: { label: 'asc' },
                select: { label: true, optionText: true, isCorrect: true },
              },
            },
          },
          interactions: {
            orderBy: { occurredAt: 'desc' },
            select: { type: true, occurredAt: true },
          },
          quizAttempts: {
            orderBy: { submittedAt: 'desc' },
            select: { score: true, isPassed: true, submittedAt: true },
          },
        },
      });

      if (!drill) return ok(null);

      return ok({
        id: drill.id,
        title: drill.title,
        status: drill.status,
        channel: drill.channel,
        subject: drill.subject,
        body: drill.body,
        guidanceText: drill.guidanceText,
        sentAt: drill.sentAt,
        quizQuestions: drill.quizQuestions,
        interactions: drill.interactions,
        quizAttempts: drill.quizAttempts,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
});
