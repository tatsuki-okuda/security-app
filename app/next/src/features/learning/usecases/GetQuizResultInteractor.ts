import { err, ok } from '../../../shared/fp/result';

import { QuizRepository } from './gateway/QuizRepository';
import { GetQuizResultUseCase } from './GetQuizResultUseCase';

export type GetQuizResultDeps = { repo: QuizRepository };

export const createGetQuizResultInteractor =
  ({ repo }: GetQuizResultDeps): GetQuizResultUseCase =>
  async ({ drillId, token }) => {
    const normalized = drillId.trim();
    const normalizedToken = token.trim();
    if (!normalized || !normalizedToken) {
      return err({ type: 'VALIDATION', message: '無効な訓練です' });
    }

    const recipientResult = await repo.findRecipientByToken(normalizedToken);
    if (!recipientResult.ok) {
      return err({ type: 'REPO', message: recipientResult.error.message });
    }
    if (!recipientResult.value || recipientResult.value.drillId !== normalized || !recipientResult.value.userId) {
      return err({ type: 'NOT_FOUND' });
    }

    const latestResult = await repo.getLatestPassedAttempt(normalized, recipientResult.value.userId);
    if (!latestResult.ok) {
      return err({ type: 'REPO', message: latestResult.error.message });
    }
    if (!latestResult.value) {
      return err({ type: 'NOT_FOUND' });
    }

    const countResult = await repo.getAttemptCount(normalized, recipientResult.value.userId);
    if (!countResult.ok) {
      return err({ type: 'REPO', message: countResult.error.message });
    }

    return ok({ score: latestResult.value.score, attemptCount: countResult.value });
  };
