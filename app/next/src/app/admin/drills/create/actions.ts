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
    targetType: String(formData.get('targetType') ?? 'all'),
    targetCount: formData.get('targetCount') ? Number(formData.get('targetCount')) : null,
    targetUserIds: String(formData.get('targetUserIds') ?? ''),
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
    targetUserIdsArray = [];
  }

  const c = createContainer();
  const created = await c.drill.usecases.create({
    ...parsed.data,
    targetType: parsed.data.targetType as 'all' | 'specific' | 'random',
    targetUserIds: targetUserIdsArray,
    quiz: undefined,
    status: parsed.data.actionType as 'draft' | 'deliverable' | 'delivering',
  });

  if (!created.ok) {
    if (created.error.type === 'VALIDATION') {
      return { status: 'error', fieldErrors: created.error.fieldErrors };
    }
    return { status: 'error', formError: created.error.message };
  }

  redirect(`/admin/drills/${created.value.drillId}/edit`);
};
