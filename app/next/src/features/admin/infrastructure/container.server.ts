import { createGetDrillDetailInteractor } from '../usecases/GetDrillDetailUseCase';
import { createGetUserDetailInteractor } from '../usecases/GetUserDetailUseCase';
import { createListDrillsInteractor } from '../usecases/ListDrillsUseCase';
import { createListUsersInteractor } from '../usecases/ListUsersUseCase';
import { createUpdateUserRoleInteractor } from '../usecases/UpdateUserRoleUseCase';

import { createPrismaAdminRepository } from './prisma/PrismaAdminRepository';

export const createAdminContainer = () => {
  const repo = createPrismaAdminRepository();
  return {
    usecases: {
      listUsers: createListUsersInteractor(repo),
      getUserDetail: createGetUserDetailInteractor(repo),
      updateUserRole: createUpdateUserRoleInteractor(repo),
      listDrills: createListDrillsInteractor(repo),
      getDrillDetail: createGetDrillDetailInteractor(repo),
    },
  };
};
