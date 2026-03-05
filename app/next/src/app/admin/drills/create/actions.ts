'use server';

import { redirect } from 'next/navigation';

import { createContainer } from '../../../../_di/container.server';
import { createDrillSchema } from '../../../../features/drill/validators/createDrill';

import type { CreateDrillActionState } from '../../../../features/drill/contracts/createDrill';

export const createDrillAction = async (
  _prev: CreateDrillActionState,
  formData: FormData,
): Promise<CreateDrillActionState> => {
  const raw = {
    title: String(formData.get('title') ?? ''),
    scenarioType: String(formData.get('scenarioType') ?? ''),
    channel: String(formData.get('channel') ?? ''),
    subject: String(formData.get('subject') ?? ''),
    body: String(formData.get('body') ?? ''),
    guidanceText: String(formData.get('guidanceText') ?? ''),
    actionType: String(formData.get('actionType') ?? ''),
  };

  const parsed = createDrillSchema.safeParse(raw);
  if (!parsed.success) {
    const fe = parsed.error.flatten().fieldErrors;
    return { status: 'error', fieldErrors: fe };
  }

  const c = createContainer();
  const created = await c.drill.usecases.create({
    ...parsed.data,
    quiz: parsed.data.quizQuestions ? JSON.parse(parsed.data.quizQuestions) : undefined,
    status: parsed.data.actionType,
  });

  if (!created.ok) {
    if (created.error.type === 'VALIDATION') {
      return { status: 'error', fieldErrors: created.error.fieldErrors };
    }
    return { status: 'error', formError: created.error.message };
  }

  // 即時配信が選ばれた場合のみ配信処理を実行
  if (parsed.data.actionType === 'delivering') {
    const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
    const sendResult = await c.drill.usecases.send({
      drillId: created.value.drillId,
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

  redirect(`/admin/drills/${created.value.drillId}`);
};
