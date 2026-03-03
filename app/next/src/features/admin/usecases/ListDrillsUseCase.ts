import { Result } from '../../../shared/fp/result';
import { AdminRepository, DrillListItem } from './gateway/AdminRepository';

export type ListDrillsError = { type: 'REPO'; message: string };

export type ListDrillsUseCase = () => Promise<Result<DrillListItem[], ListDrillsError>>;

export const createListDrillsInteractor = (repo: AdminRepository): ListDrillsUseCase => async () => {
  const result = await repo.listDrills();
  if (!result.ok) return { ok: false, error: { type: 'REPO', message: result.error.message } };
  return { ok: true, value: result.value };
};
