'use server';

import { redirect } from 'next/navigation';

import { createContainer } from '../../../../_di/container.server';

import type { QuizActionState } from '../../../../features/learning/contracts/quiz';

export const submitQuizAction = async (_prev: QuizActionState, formData: FormData): Promise<QuizActionState> => {
  const drillId = String(formData.get('drillId') ?? '');
  const token = String(formData.get('token') ?? '');

  const answers: Record<string, string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith('q_')) continue;
    const questionId = key.replace('q_', '');
    const existing = answers[questionId] ?? [];
    answers[questionId] = [...existing, String(value)];
  }

  const c = createContainer();
  const result = await c.learning.usecases.submitQuiz({ drillId, token, answers });

  if (!result.ok) {
    if (result.error.type === 'VALIDATION') {
      const formError = result.error.fieldErrors._form?.[0];
      return { status: 'error', fieldErrors: result.error.fieldErrors, formError };
    }
    if (result.error.type === 'NOT_FOUND') {
      return { status: 'error', formError: '無効なリンクです' };
    }
    return { status: 'error', formError: result.error.message };
  }

  if (result.value.passed) {
    redirect(`/learn/${drillId}/complete?token=${encodeURIComponent(token)}`);
  }

  return { status: 'failed', score: result.value.score, explanations: result.value.explanations };
};
