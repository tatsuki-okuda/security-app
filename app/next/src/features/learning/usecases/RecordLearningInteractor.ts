import { err, ok } from '../../../shared/fp/result';

import { RecordLearningUseCase } from './RecordLearningUseCase';
import { LearningRepository } from './gateway/LearningRepository';

export type RecordLearningDeps = { repo: LearningRepository };

export const createRecordLearningInteractor =
  ({ repo }: RecordLearningDeps): RecordLearningUseCase =>
  async ({ drillId, token }) => {
    const normalized = drillId.trim();
    const normalizedToken = token.trim();
    if (!normalized || !normalizedToken) {
      return err({ type: 'VALIDATION', message: '無効な訓練です' });
    }

    const result = await repo.recordLearning({ drillId: normalized, token: normalizedToken });
    if (!result.ok) {
      return err({ type: 'REPO', message: result.error.message });
    }

    return ok(undefined);
  };
