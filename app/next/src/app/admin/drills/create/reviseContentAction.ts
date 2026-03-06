'use server';

import { createContainer } from '../../../../_di/container.server';

// Reuse the state type, or create a new one. We'll use a specific type for revision.
export type ReviseContentActionState =
  | { status: 'idle' }
  | { status: 'success'; data: { subject: string; body: string; guidanceText: string; ctaText: string; ctaUrlPlaceholder: string; riskNotes: string; } }
  | { status: 'error'; formError?: string };

export const reviseContentAction = async (
  _prev: ReviseContentActionState,
  formData: FormData,
): Promise<ReviseContentActionState> => {
  const editPrompt = String(formData.get('editPrompt') ?? '');
  const currentSubject = String(formData.get('currentSubject') ?? '');
  const currentBody = String(formData.get('currentBody') ?? '');
  const currentCtaText = String(formData.get('currentCtaText') ?? '');
  const currentCtaUrlPlaceholder = String(formData.get('currentCtaUrlPlaceholder') ?? '');
  const currentGuidanceText = String(formData.get('currentGuidanceText') ?? '');
  const currentRiskNotes = String(formData.get('currentRiskNotes') ?? '');

  if (!editPrompt) {
    return { status: 'error', formError: '修正指示を入力してください' };
  }

  const c = createContainer();
  const result = await c.llm.usecases.reviseContent({
    editPrompt,
    currentSubject,
    currentBody,
    currentCtaText,
    currentCtaUrlPlaceholder,
    currentGuidanceText,
    currentRiskNotes,
  });

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
    },
  };
};
