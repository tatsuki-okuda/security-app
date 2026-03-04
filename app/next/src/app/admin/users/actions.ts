'use server';

import { revalidatePath } from 'next/cache';

import { createContainer } from '../../../_di/container.server';

export async function updateUserRoleAction(userId: string, formData: FormData) {
  const role = formData.get('role');
  if (typeof role !== 'string' || !['admin', 'user'].includes(role)) {
    return { error: 'Invalid role' };
  }

  const c = createContainer();
  const result = await c.admin.usecases.updateUserRole(userId, role);

  if (!result.ok) {
    return { error: result.error.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
}
