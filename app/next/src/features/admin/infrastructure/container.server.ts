import { createGetDrillDetailInteractor } from '../usecases/GetDrillDetailUseCase';
import { createGetUserDetailInteractor } from '../usecases/GetUserDetailUseCase';
import { createListDrillsInteractor } from '../usecases/ListDrillsUseCase';
import { createListUsersInteractor } from '../usecases/ListUsersUseCase';

import { createPrismaAdminRepository } from './prisma/PrismaAdminRepository';

export const createAdminContainer = () => {
  const repo = createPrismaAdminRepository();
  return {
    usecases: {
      listUsers: createListUsersInteractor(repo),
      getUserDetail: createGetUserDetailInteractor(repo),
      listDrills: createListDrillsInteractor(repo),
      getDrillDetail: createGetDrillDetailInteractor(repo),
    },
  };
};
