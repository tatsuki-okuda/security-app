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
