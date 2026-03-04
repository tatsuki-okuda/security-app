import { err, ok } from '../../../shared/fp/result';

import { GetLearningIntroInput } from './dto/GetLearningIntroInput';
import { LearningRepository } from './gateway/LearningRepository';
import { GetLearningIntroUseCase } from './GetLearningIntroUseCase';

export type GetLearningIntroDeps = { repo: LearningRepository };

export const createGetLearningIntroInteractor =
  ({ repo }: GetLearningIntroDeps): GetLearningIntroUseCase =>
  async (input: GetLearningIntroInput) => {
    const drillId = input.drillId.trim();
    if (!drillId) {
      return err({ type: 'VALIDATION', message: '無効な訓練です' });
    }

    const drillResult = await repo.findDrillById(drillId);
    if (!drillResult.ok) {
      return err({ type: 'REPO', message: drillResult.error.message });
    }

    if (!drillResult.value) {
      return err({ type: 'NOT_FOUND' });
    }

    return ok({
      drillId: drillResult.value.id,
      title: drillResult.value.title,
      guidanceText: drillResult.value.guidanceText,
    });
  };
