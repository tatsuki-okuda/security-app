'use server';

import { createContainer } from '../../../../_di/container.server';

import type { GenerateQuizActionState } from '../../../../features/llm/contracts/generate';

export const generateQuizAction = async (
  _prev: GenerateQuizActionState,
  formData: FormData,
): Promise<GenerateQuizActionState> => {
  const scenarioType = String(formData.get('scenarioType') ?? '');
  const emailBody = String(formData.get('emailBody') ?? '');
  const userPrompt = formData.get('userPrompt') ? String(formData.get('userPrompt')) : undefined;

  if (!scenarioType) {
    return { status: 'error', formError: 'シナリオを選択してください' };
  }
  if (!emailBody) {
    return { status: 'error', formError: 'メール本文が必要です' };
  }

  const c = createContainer();
  const result = await c.llm.usecases.generateQuiz({ scenarioType, emailBody, userPrompt });

  if (!result.ok) {
    return { status: 'error', formError: result.error.message };
  }

  return {
    status: 'success',
    data: {
      quiz: result.value.quiz,
    },
  };
};
