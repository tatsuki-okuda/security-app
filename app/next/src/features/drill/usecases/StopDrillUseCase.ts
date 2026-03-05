import { err, ok } from '../../../shared/fp/result';

import type { DrillRepository } from './gateway/DrillRepository';
import type { Result } from '../../../shared/fp/result';

export type StopDrillError = { type: 'REPO'; message: string };

export type StopDrillUseCase = (drillId: string) => Promise<Result<void, StopDrillError>>;

export type StopDrillDeps = { repo: DrillRepository };

export const createStopDrillInteractor =
  ({ repo }: StopDrillDeps): StopDrillUseCase =>
  async (drillId: string) => {
    const result = await repo.updateDrillStatus({ drillId, status: 'stopped' });

    if (!result.ok) {
      return err({ type: 'REPO', message: result.error.message });
    }

    return ok(undefined);
  };
