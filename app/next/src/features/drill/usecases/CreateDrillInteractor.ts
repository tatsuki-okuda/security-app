import { err, ok } from '../../../shared/fp/result';
import { defaultQuizTemplate } from '../domain/quizTemplates';

import { CreateDrillUseCase } from './CreateDrillUseCase';
import { DrillRepository } from './gateway/DrillRepository';

export type CreateDrillDeps = { repo: DrillRepository };

export const createCreateDrillInteractor =
  ({ repo }: CreateDrillDeps): CreateDrillUseCase =>
  async (input) => {
    if (!input.title.trim()) {
      return err({ type: 'VALIDATION', fieldErrors: { title: ['訓練名を入力してください'] } });
    }

    const result = await repo.createDrillWithQuiz({
      title: input.title,
      scenarioType: input.scenarioType,
      channel: input.channel,
      targetType: input.targetType,
      targetCount: input.targetCount,
      targetUserIds: input.targetUserIds,
      subject: input.subject,
      body: input.body,
      guidanceText: input.guidanceText,
      status: input.status,
      quiz: input.quiz ?? defaultQuizTemplate,
    });

    if (!result.ok) {
      return err({ type: 'REPO', message: result.error.message });
    }

    return ok({ drillId: result.value.drillId });
  };
