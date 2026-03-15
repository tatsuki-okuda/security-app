'use server';

import { revalidatePath } from 'next/cache';
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
    targetType: String(formData.get('targetType') ?? 'all'),
    targetCount: formData.get('targetCount') ? Number(formData.get('targetCount')) : null,
    targetUserIds: String(formData.get('targetUserIds') ?? ''),
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

  let targetUserIdsArray: string[] = [];
  try {
    const rawIds = parsed.data.targetUserIds;
    if (rawIds) {
      let current: unknown = rawIds;
      while (typeof current === 'string' && (current.startsWith('[') || current.startsWith('"'))) {
        const next = JSON.parse(current);
        if (current === next) break;
        current = next;
      }
      
      if (Array.isArray(current)) {
        targetUserIdsArray = current as string[];
      } else if (typeof current === 'string') {
        const cleaned = current
          .replace(/^"+|"+$/g, '')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
        
        if (cleaned.startsWith('[')) {
          targetUserIdsArray = JSON.parse(cleaned);
        } else if (cleaned.includes(',')) {
          targetUserIdsArray = cleaned.split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean);
        } else {
          targetUserIdsArray = [cleaned.trim().replace(/^"|"$/g, '')].filter(Boolean);
        }
      }
    }
  } catch {
    // fallback to empty array if parsing completely fails
    targetUserIdsArray = [];
  }

  const c = createContainer();
  const updated = await c.drill.usecases.update({
    drillId: parsed.data.drillId,
    channel: parsed.data.channel,
    targetType: parsed.data.targetType as 'all' | 'specific' | 'random',
    targetCount: parsed.data.targetCount,
    targetUserIds: targetUserIdsArray,
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

  revalidatePath(`/admin/drills/${parsed.data.drillId}`);
  revalidatePath(`/admin/drills`);
  redirect(`/admin/drills/${parsed.data.drillId}`);
};
