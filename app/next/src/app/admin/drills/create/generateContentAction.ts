'use server';

import { createContainer } from '../../../../_di/container.server';

import type { GenerateContentActionState } from '../../../../features/llm/contracts/generate';

export const generateContentAction = async (
  _prev: GenerateContentActionState,
  formData: FormData,
): Promise<GenerateContentActionState> => {
  const scenarioType = String(formData.get('scenarioType') ?? '');
  const userPrompt = formData.get('userPrompt') ? String(formData.get('userPrompt')) : undefined;

  if (!scenarioType) {
    return { status: 'error', formError: 'シナリオを選択してください' };
  }

  const c = createContainer();
  const result = await c.llm.usecases.generateContent({ scenarioType, userPrompt });

  if (!result.ok) {
    return { status: 'error', formError: result.error.message };
  }

  return {
    status: 'success',
    data: {
      subject: result.value.subject,
      body: result.value.body,
      guidanceText: result.value.guidanceText,
      ctaText: result.value.ctaText,
      ctaUrlPlaceholder: result.value.ctaUrlPlaceholder,
      riskNotes: result.value.riskNotes,
      quiz: result.value.quiz,
    },
  };
};
