'use server';

import { revalidatePath } from 'next/cache';

import { createContainer } from '../../../../_di/container.server';

export const stopDrillAction = async (drillId: string) => {
  const c = createContainer();
  const result = await c.drill.usecases.stop(drillId);

  if (!result.ok) {
    return { error: result.error.message };
  }

  revalidatePath(`/admin/drills/${drillId}`);
  revalidatePath('/admin/drills');
  return { success: true };
};

export const startDrillAction = async (drillId: string) => {
  const c = createContainer();
  const drillResult = await c.admin.usecases.getDrillDetail(drillId);

  if (!drillResult.ok) {
    return { error: '訓練の取得に失敗しました' };
  }

  const drill = drillResult.value;

  if (drill.status !== 'deliverable') {
    return { error: '配信可能な状態ではありません' };
  }

  const baseUrl = process.env.APP_BASE_URL ?? 'http://localhost:3000';
  const sendResult = await c.drill.usecases.send({
    drillId,
    channel: drill.channel as 'email' | 'slack' | 'both',
    subject: drill.subject,
    body: drill.body,
    guidanceText: drill.guidanceText,
    baseUrl,
  });

  if (!sendResult.ok) {
    return { error: sendResult.error.message };
  }

  revalidatePath(`/admin/drills/${drillId}`);
  revalidatePath('/admin/drills');
  return { success: true };
};
