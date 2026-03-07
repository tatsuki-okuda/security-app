'use server';

import { createContainer } from '../../../../_di/container.server';
import { validateUserPrompt } from '../../../../features/llm/domain/userPromptValidation';

import type { GenerateQuizActionState } from '../../../../features/llm/contracts/generate';

export const generateQuizAction = async (
  _prev: GenerateQuizActionState,
  formData: FormData,
): Promise<GenerateQuizActionState> => {
  const scenarioType = String(formData.get('scenarioType') ?? '');
  const emailBody = String(formData.get('emailBody') ?? '');
  const rawUserPrompt = formData.get('userPrompt') ? String(formData.get('userPrompt')) : '';

  if (!scenarioType) {
    return { status: 'error', formError: 'シナリオを選択してください' };
  }
  if (!emailBody) {
    return { status: 'error', formError: 'メール本文が必要です' };
  }

  const validation = validateUserPrompt(rawUserPrompt);
  if (!validation.ok) {
    return { status: 'error', formError: validation.formError };
  }
  const userPrompt = validation.sanitized || undefined;

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
