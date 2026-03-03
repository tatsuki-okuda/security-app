import { err, ok } from '../../../shared/fp/result';

import { scoreQuiz } from '../domain/quizScoring';

import { SubmitQuizUseCase } from './SubmitQuizUseCase';
import { QuizRepository } from './gateway/QuizRepository';

export type SubmitQuizDeps = { repo: QuizRepository };

export const createSubmitQuizInteractor =
  ({ repo }: SubmitQuizDeps): SubmitQuizUseCase =>
  async (input) => {
    const token = input.token.trim();
    if (!token) {
      return err({ type: 'VALIDATION', fieldErrors: { _form: ['無効なリンクです'] } });
    }

    const recipientResult = await repo.findRecipientByToken(token);
    if (!recipientResult.ok) {
      return err({ type: 'REPO', message: recipientResult.error.message });
    }
    if (!recipientResult.value) {
      return err({ type: 'NOT_FOUND' });
    }
    if (recipientResult.value.drillId !== input.drillId) {
      return err({ type: 'NOT_FOUND' });
    }
    if (!recipientResult.value.userId) {
      return err({ type: 'NOT_FOUND' });
    }

    const quizResult = await repo.fetchQuiz(input.drillId);
    if (!quizResult.ok) {
      return err({ type: 'REPO', message: quizResult.error.message });
    }
    if (quizResult.value.length === 0) {
      return err({ type: 'NOT_FOUND' });
    }

    const fieldErrors: Record<string, string[]> = {};
    for (const question of quizResult.value) {
      const selected = input.answers[question.id] ?? [];
      if (selected.length === 0) {
        fieldErrors[`q_${question.id}`] = ['選択してください'];
      }
    }
    if (Object.keys(fieldErrors).length > 0) {
      return err({ type: 'VALIDATION', fieldErrors });
    }

    const scoreInput = quizResult.value.map((q) => ({
      id: q.id,
      type: q.questionType === 'single_choice' ? 'radio' : 'checkbox',
      correctOptionIds: q.options.filter((opt) => opt.isCorrect).map((opt) => opt.id),
    }));

    const answersInput = quizResult.value.map((q) => ({
      questionId: q.id,
      questionType: q.questionType,
      selectedOptionIds: input.answers[q.id] ?? [],
    }));

    const scoring = scoreQuiz(scoreInput, answersInput);
    const passed = scoring.score >= 80;

    const attemptNoResult = await repo.getNextAttemptNo(input.drillId, recipientResult.value.userId);
    if (!attemptNoResult.ok) {
      return err({ type: 'REPO', message: attemptNoResult.error.message });
    }

    const createResult = await repo.createAttemptWithAnswers({
      drillId: input.drillId,
      userId: recipientResult.value.userId,
      attemptNo: attemptNoResult.value,
      score: scoring.score,
      isPassed: passed,
      answers: answersInput.map((answer) => ({
        questionId: answer.questionId,
        questionType: answer.questionType,
        selectedOptionIds: answer.selectedOptionIds,
        isCorrect: scoring.perQuestion[answer.questionId] ?? false,
      })),
    });

    if (!createResult.ok) {
      return err({ type: 'REPO', message: createResult.error.message });
    }

    const interactionResult = await repo.recordQuizInteraction({
      drillId: input.drillId,
      userId: recipientResult.value.userId,
      score: scoring.score,
      isPassed: passed,
    });

    if (!interactionResult.ok) {
      return err({ type: 'REPO', message: interactionResult.error.message });
    }

    const explanations: Record<string, string> = {};
    quizResult.value.forEach((q) => {
      explanations[q.id] = q.explanation;
    });

    return ok({ score: scoring.score, passed, explanations });
  };
