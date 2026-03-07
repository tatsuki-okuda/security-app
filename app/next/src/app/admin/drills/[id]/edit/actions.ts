'use server';

import { redirect } from 'next/navigation';

import { createContainer } from '../../../../../_di/container.server';
import { updateDrillSchema } from '../../../../../features/drill/validators/updateDrill';

import type { UpdateDrillActionState } from '../../../../../features/drill/contracts/updateDrill';

export const updateDrillAction = async (
  _prev: UpdateDrillActionState,
  formData: FormData,
): Promise<UpdateDrillActionState> => {
  const raw = {
    drillId: String(formData.get('drillId') ?? ''),
    channel: String(formData.get('channel') ?? ''),
    subject: String(formData.get('subject') ?? ''),
    body: String(formData.get('body') ?? ''),
    guidanceText: String(formData.get('guidanceText') ?? ''),
    quizQuestions: String(formData.get('quizQuestions') ?? ''),
    actionType: String(formData.get('actionType') ?? ''),
  };

  const parsed = updateDrillSchema.safeParse(raw);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return { status: 'error', fieldErrors: fe };
  }

  const c = createContainer();
  const updated = await c.drill.usecases.update({
    drillId: parsed.data.drillId,
    subject: parsed.data.subject,
    body: parsed.data.body,
    guidanceText: parsed.data.guidanceText,
    quiz: parsed.data.quizQuestions ? JSON.parse(parsed.data.quizQuestions) : [],
    status: parsed.data.actionType as 'draft' | 'deliverable' | 'delivering',
  });

  if (!updated.ok) {
    if (updated.error.type === 'VALIDATION') {
      return { status: 'error', fieldErrors: updated.error.fieldErrors };
    }
    return { status: 'error', formError: updated.error.message };
  }

  if (parsed.data.actionType === 'delivering') {
    const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
    const sendResult = await c.drill.usecases.send({
      drillId: parsed.data.drillId,
      channel: parsed.data.channel,
      subject: parsed.data.subject,
      body: parsed.data.body,
      guidanceText: parsed.data.guidanceText,
      baseUrl,
    });

    if (!sendResult.ok) {
      return { status: 'error', formError: sendResult.error.message };
    }
  }

  redirect(`/admin/drills/${parsed.data.drillId}`);
};
