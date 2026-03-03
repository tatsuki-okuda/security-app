import { Result } from '../../../shared/fp/result';
import { AdminRepository, UserDetail } from './gateway/AdminRepository';

export type GetUserDetailError = { type: 'NOT_FOUND' } | { type: 'REPO'; message: string };

export type GetUserDetailUseCase = (userId: string) => Promise<Result<UserDetail, GetUserDetailError>>;

export const createGetUserDetailInteractor = (repo: AdminRepository): GetUserDetailUseCase => async (userId) => {
  const result = await repo.getUserDetail(userId);
  if (!result.ok) return { ok: false, error: { type: 'REPO', message: result.error.message } };
  if (!result.value) return { ok: false, error: { type: 'NOT_FOUND' } };
  return { ok: true, value: result.value };
};
