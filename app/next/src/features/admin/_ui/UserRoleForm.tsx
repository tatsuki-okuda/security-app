'use client';

import { useRouter } from 'next/navigation';

import { updateUserRoleAction } from '../../../app/admin/users/actions';

export function UserRoleForm({
  userId,
  initialRole,
  isDisabled = false,
}: {
  userId: string;
  initialRole: string;
  isDisabled?: boolean;
}) {
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
      disabled={isDisabled}
      className={`rounded border px-2 py-1 text-sm ${
        isDisabled
          ? 'cursor-not-allowed border-none bg-transparent font-semibold text-text-secondary' // マスター管理者の場合の見た目
          : initialRole === 'admin'
            ? 'border-slate-300 bg-amber-50 text-amber-700'
            : 'border-slate-300 bg-bg text-text-primary'
      }`}
    >
      <option value="user">User</option>
      <option value="admin">Admin</option>
    </select>
  );
}
