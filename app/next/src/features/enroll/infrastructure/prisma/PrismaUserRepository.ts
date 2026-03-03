import { prisma } from '@/prismaClient';

import { ok, err } from '../../../../shared/fp/result';
import { UserRepository } from '../../usecases/gateway/UserRepository';

// prisma client をどこに置くかは好み。
// ここでは簡易的に import できる想定にしてる。

export const createPrismaUserRepository = (): UserRepository => ({
  enroll: async ({ email, consentedAt, slackUserId }) => {
    try {
      const user = await prisma.user.create({
        data: { email: email.value, consentedAt, slackUserId: slackUserId || null },
        select: { id: true },
      });
      return ok({ userId: user.id });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      // Prismaのユニーク制約例外（P2002）などをここでマップ
      if (e?.code === 'P2002') return err({ type: 'DUPLICATE' });
      return err({ type: 'DB', message: e?.message ?? 'DBエラーが発生しました' });
    }
  },
});
