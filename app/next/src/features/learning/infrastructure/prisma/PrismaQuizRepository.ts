import { prisma } from '@/prismaClient';

import { err, ok } from '../../../../shared/fp/result';
import { QuizRepository } from '../../usecases/gateway/QuizRepository';

export const createPrismaQuizRepository = (): QuizRepository => ({
  findRecipientByToken: async (token) => {
    try {
      const trackingToken = await prisma.trackingToken.findUnique({
        where: { token },
        select: {
          drillId: true,
          drillRecipientId: true,
          drillRecipient: {
            select: { userId: true },
          },
        },
      });

      if (!trackingToken || !trackingToken.drillRecipient?.userId) return ok(null);

      return ok({
        drillId: trackingToken.drillId,
        userId: trackingToken.drillRecipient.userId,
        drillRecipientId: trackingToken.drillRecipientId,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  fetchQuiz: async (drillId) => {
    try {
      const questions = await prisma.quizQuestion.findMany({
        where: { drillId },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          order: true,
          questionType: true,
          questionText: true,
          explanation: true,
          options: {
            orderBy: { label: 'asc' },
            select: {
              id: true,
              label: true,
              optionText: true,
              isCorrect: true,
            },
          },
        },
      });

      return ok(questions);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  getNextAttemptNo: async (drillId, userId) => {
    try {
      const lastAttempt = await prisma.quizAttempt.findFirst({
        where: { drillId, userId },
        orderBy: { attemptNo: 'desc' },
        select: { attemptNo: true },
      });

      return ok((lastAttempt?.attemptNo ?? 0) + 1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  createAttemptWithAnswers: async ({ drillId, userId, attemptNo, score, isPassed, answers }) => {
    try {
      const attempt = await prisma.$transaction(async (tx) => {
        const createdAttempt = await tx.quizAttempt.create({
          data: {
            drillId,
            userId,
            attemptNo,
            score,
            isPassed,
            submittedAt: new Date(),
          },
          select: {
            id: true,
            attemptNo: true,
            score: true,
            isPassed: true,
            submittedAt: true,
          },
        });

        await tx.quizAnswer.createMany({
          data: answers.map((answer) => ({
            attemptId: createdAttempt.id,
            questionId: answer.questionId,
            selectedOptionId:
              answer.questionType === 'single_choice' ? answer.selectedOptionIds[0] ?? null : null,
            selectedOptionIds: answer.questionType === 'multiple_choice' ? answer.selectedOptionIds : null,
            isCorrect: answer.isCorrect,
          })),
        });

        return createdAttempt;
      });

      return ok({
        id: attempt.id,
        attemptNo: attempt.attemptNo,
        score: attempt.score,
        isPassed: attempt.isPassed,
        submittedAt: attempt.submittedAt,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  recordQuizInteraction: async ({ drillId, userId, score, isPassed }) => {
    try {
      await prisma.interaction.create({
        data: {
          drillId,
          userId,
          type: 'quiz_submit',
          metadata: { score, passed: isPassed },
        },
      });
      return ok(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  getLatestPassedAttempt: async (drillId, userId) => {
    try {
      const attempt = await prisma.quizAttempt.findFirst({
        where: { drillId, userId, isPassed: true },
        orderBy: { submittedAt: 'desc' },
        select: {
          id: true,
          attemptNo: true,
          score: true,
          isPassed: true,
          submittedAt: true,
        },
      });

      return ok(attempt);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  getAttemptCount: async (drillId, userId) => {
    try {
      const count = await prisma.quizAttempt.count({
        where: { drillId, userId },
      });
      return ok(count);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
});
