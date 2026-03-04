'use client';

import { useRouter } from 'next/navigation';

import { updateUserRoleAction } from '../../../app/admin/users/actions';

export function UserRoleForm({ userId, initialRole }: { userId: string; initialRole: string }) {
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    const formData = new FormData();
    formData.append('role', newRole);

    await updateUserRoleAction(userId, formData);
    // UI is re-rendered due to revalidatePath in the action, but refresh to be safe
    router.refresh();
  };

  return (
    <select
      defaultValue={initialRole}
      onChange={handleChange}
      className={`rounded border border-slate-300 px-2 py-1 text-sm ${
        initialRole === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-slate-700'
      }`}
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  );
}
