import { err, ok } from '../../../shared/fp/result';
import { LlmGateway } from '../../llm/usecases/gateway/LlmGateway';
import { scoreQuiz } from '../domain/quizScoring';

import { QuizRepository } from './gateway/QuizRepository';
import { SubmitQuizUseCase } from './SubmitQuizUseCase';

export type SubmitQuizDeps = { repo: QuizRepository; llmGateway: LlmGateway };

export const createSubmitQuizInteractor =
  ({ repo, llmGateway }: SubmitQuizDeps): SubmitQuizUseCase =>
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
      type: (q.questionType === 'single_choice' ? 'radio' : 'checkbox') as 'radio' | 'checkbox',
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
    const quizContextForLlm = quizResult.value.map((q) => {
      explanations[q.id] = q.explanation;
      return {
        order: q.order,
        questionType: q.questionType,
        questionText: q.questionText,
        explanation: q.explanation,
        options: q.options,
      };
    });

    // 履歴を取得してLLMでフィードバック生成
    const historyResult = await repo.getUserAttempts(input.drillId, recipientResult.value.userId);
    let generatedFeedback: undefined | { strengths: string[]; improvements: string[]; advice: string[]; overallFeedback: string };
    
    if (historyResult.ok && historyResult.value.length > 0) {
      const mappedHistory = historyResult.value.map(h => ({
        attemptNo: h.attemptNo,
        score: h.score,
        passed: h.isPassed,
        answers: h.answers
      }));

      const feedbackResult = await llmGateway.generateQuizFeedback({
        history: mappedHistory,
        quizContext: quizContextForLlm,
      });

      if (feedbackResult.ok) {
        generatedFeedback = feedbackResult.value;
        // DBに保存する（失敗してもクイズ結果自体は返す）
        await repo.updateAttemptFeedback(createResult.value.id, feedbackResult.value);
      } else {
      }
    }

    return ok({ score: scoring.score, passed, explanations, feedback: generatedFeedback });
  };
