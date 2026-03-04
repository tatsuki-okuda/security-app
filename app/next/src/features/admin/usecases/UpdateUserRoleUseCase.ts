import { Result } from '../../../shared/fp/result';

import { AdminRepository } from './gateway/AdminRepository';

export type UpdateUserRoleError = { type: 'REPO'; message: string };

export type UpdateUserRoleUseCase = (userId: string, role: string) => Promise<Result<void, UpdateUserRoleError>>;

export const createUpdateUserRoleInteractor =
  (repo: AdminRepository): UpdateUserRoleUseCase =>
  async (userId, role) => {
    const result = await repo.updateUserRole(userId, role);
    if (!result.ok) return { ok: false, error: { type: 'REPO', message: result.error.message } };
    return { ok: true, value: undefined };
  };
