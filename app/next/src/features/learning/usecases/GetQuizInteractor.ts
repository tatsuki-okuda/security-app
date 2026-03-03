import { err, ok } from '../../../shared/fp/result';

import { GetQuizUseCase } from './GetQuizUseCase';
import { QuizRepository } from './gateway/QuizRepository';

export type GetQuizDeps = { repo: QuizRepository };

export const createGetQuizInteractor =
  ({ repo }: GetQuizDeps): GetQuizUseCase =>
  async ({ drillId }) => {
    const normalized = drillId.trim();
    if (!normalized) {
      return err({ type: 'VALIDATION', message: '無効な訓練です' });
    }

    const quizResult = await repo.fetchQuiz(normalized);
    if (!quizResult.ok) {
      return err({ type: 'REPO', message: quizResult.error.message });
    }

    if (quizResult.value.length === 0) {
      return err({ type: 'NOT_FOUND' });
    }

    const view = quizResult.value.map((q) => ({
      id: q.id,
      order: q.order,
      type: q.questionType === 'single_choice' ? 'radio' : 'checkbox',
      questionText: q.questionText,
      explanation: q.explanation,
      options: q.options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        optionText: opt.optionText,
      })),
    }));

    return ok(view);
  };
