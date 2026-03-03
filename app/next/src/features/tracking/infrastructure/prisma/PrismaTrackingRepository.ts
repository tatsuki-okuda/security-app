import { prisma } from '@/prismaClient';

import { err, ok } from '../../../../shared/fp/result';
import { TrackingRepository } from '../../usecases/gateway/TrackingRepository';

export const createPrismaTrackingRepository = (): TrackingRepository => ({
  findToken: async (token) => {
    try {
      const trackingToken = await prisma.trackingToken.findUnique({
        where: { token },
        select: {
          id: true,
          drillId: true,
          isActive: true,
          expiresAt: true,
          drillRecipientId: true,
          drillRecipient: {
            select: {
              userId: true,
            },
          },
        },
      });

      if (!trackingToken) return ok(null);

      return ok({
        id: trackingToken.id,
        drillId: trackingToken.drillId,
        isActive: trackingToken.isActive,
        expiresAt: trackingToken.expiresAt,
        drillRecipientId: trackingToken.drillRecipientId,
        userId: trackingToken.drillRecipient?.userId ?? null,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
  recordClick: async ({ drillId, trackingTokenId, drillRecipientId, userId }) => {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.interaction.create({
          data: {
            drillId,
            trackingTokenId,
            userId: userId ?? null,
            type: 'click',
          },
        });

        if (drillRecipientId) {
          await tx.drillRecipient.update({
            where: { id: drillRecipientId },
            data: { clickedAt: new Date() },
          });
        }
      });
      return ok(undefined);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
});
