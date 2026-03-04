import { Result } from '../../../shared/fp/result';

import { AdminRepository, UserListItem } from './gateway/AdminRepository';

export type ListUsersError = { type: 'REPO'; message: string };

export type ListUsersUseCase = () => Promise<Result<UserListItem[], ListUsersError>>;

export const createListUsersInteractor =
  (repo: AdminRepository): ListUsersUseCase =>
  async () => {
    const result = await repo.listUsers();
    if (!result.ok) return { ok: false, error: { type: 'REPO', message: result.error.message } };
    return { ok: true, value: result.value };
  };
