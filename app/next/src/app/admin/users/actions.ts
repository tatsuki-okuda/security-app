'use server';

import { revalidatePath } from 'next/cache';

import { createContainer } from '../../../_di/container.server';

export async function updateUserRoleAction(userId: string, formData: FormData) {
  const role = formData.get('role');
  if (typeof role !== 'string' || !['admin', 'user'].includes(role)) {
    return { error: 'Invalid role' };
  }

  const c = createContainer();

  // 対象ユーザーがマスター管理者の場合は変更を許可しない
  const userResult = await c.admin.usecases.getUserDetail(userId);
  if (!userResult.ok || !userResult.value) {
    return { error: 'User not found' };
  }
  const adminEmails = process.env.AUTH_ADMIN_EMAILS?.split(',').map((e) => e.trim()) || [];
  if (adminEmails.includes(userResult.value.email)) {
    return { error: 'Master admin roles cannot be changed' };
  }

  const result = await c.admin.usecases.updateUserRole(userId, role);

  if (!result.ok) {
    return { error: result.error.message };
  }

  revalidatePath('/admin/users');
  return { success: true };
}
