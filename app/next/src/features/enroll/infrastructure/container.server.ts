import { createEnrollUserInteractor } from '../usecases/EnrollUserInteractor';

import { createPrismaUserRepository } from './prisma/PrismaUserRepository';

export const createEnrollContainer = () => {
  const repo = createPrismaUserRepository();
  return {
    usecases: {
      enroll: createEnrollUserInteractor({ repo }),
    },
  };
};
