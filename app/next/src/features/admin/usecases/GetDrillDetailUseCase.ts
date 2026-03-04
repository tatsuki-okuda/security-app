import { Result } from '../../../shared/fp/result';

import { AdminRepository, DrillDetail } from './gateway/AdminRepository';

export type GetDrillDetailError = { type: 'NOT_FOUND' } | { type: 'REPO'; message: string };

export type GetDrillDetailUseCase = (drillId: string) => Promise<Result<DrillDetail, GetDrillDetailError>>;

export const createGetDrillDetailInteractor =
  (repo: AdminRepository): GetDrillDetailUseCase =>
  async (drillId) => {
    const result = await repo.getDrillDetail(drillId);
    if (!result.ok) return { ok: false, error: { type: 'REPO', message: result.error.message } };
    if (!result.value) return { ok: false, error: { type: 'NOT_FOUND' } };
    return { ok: true, value: result.value };
  };
