import { err, ok } from '../../../shared/fp/result';

import { DrillRepository } from './gateway/DrillRepository';
import { UpdateDrillUseCase } from './UpdateDrillUseCase';

export const createUpdateDrillInteractor = (repo: DrillRepository): UpdateDrillUseCase => {
  return async (input) => {
    // 必須項目のチェック (draft 以外の場合)
    if (input.status === 'deliverable' || input.status === 'delivering') {
      const fieldErrors: Record<string, string[]> = {};
      
      if (!input.subject) fieldErrors.subject = ['件名を入力してください'];
      if (!input.body) fieldErrors.body = ['本文を入力してください'];
      if (!input.guidanceText) fieldErrors.guidanceText = ['誘導テキストを入力してください'];
      
      if (!input.quiz || input.quiz.length === 0) {
        fieldErrors.quizQuestions = ['クイズ問題を入力するかAI生成してください'];
      }
      
      if (Object.keys(fieldErrors).length > 0) {
        return err({ type: 'VALIDATION', fieldErrors });
      }
    }

    const saved = await repo.updateDrillWithQuiz({
      drillId: input.drillId,
      channel: input.channel,
      targetType: input.targetType,
      targetCount: input.targetCount,
      targetUserIds: input.targetUserIds,
      subject: input.subject,
      body: input.body,
      guidanceText: input.guidanceText,
      quiz: input.quiz,
      status: input.status,
    });

    if (!saved.ok) {
      return err({ type: 'REPO', message: saved.error.message });
    }

    return ok(undefined);
  };
};
