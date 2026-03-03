import { prisma } from '@/prismaClient';

import { err, ok } from '../../../../shared/fp/result';
import { LearningRepository } from '../../usecases/gateway/LearningRepository';

export const createPrismaLearningRepository = (): LearningRepository => ({
  findDrillById: async (id) => {
    try {
      const drill = await prisma.drill.findUnique({
        where: { id },
        select: { id: true, title: true, guidanceText: true },
      });

      if (!drill) return ok(null);

      return ok({ id: drill.id, title: drill.title, guidanceText: drill.guidanceText });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  recordLearning: async ({ drillId, token }) => {
    try {
      await prisma.$transaction(async (tx) => {
        const trackingToken = await tx.trackingToken.findUnique({
          where: { token },
          select: { id: true, drillId: true, drillRecipientId: true, drillRecipient: { select: { userId: true } } },
        });

        if (!trackingToken || trackingToken.drillId !== drillId) {
          return;
        }

        if (trackingToken.drillRecipientId) {
          await tx.drillRecipient.update({
            where: { id: trackingToken.drillRecipientId },
            data: { learnedAt: new Date() },
          });
        }

        await tx.interaction.create({
          data: {
            drillId,
            userId: trackingToken.drillRecipient?.userId ?? null,
            trackingTokenId: trackingToken.id,
            type: 'learn',
          },
        });
      });

      return ok(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
});
