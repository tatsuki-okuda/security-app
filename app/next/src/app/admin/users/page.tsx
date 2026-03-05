import Link from 'next/link';

import { createContainer } from '../../../_di/container.server';
import { UserRoleForm } from '../../../features/admin/_ui/UserRoleForm';

export default async function Page() {
  const c = createContainer();
  const result = await c.admin.usecases.listUsers();

  const adminEmails = process.env.AUTH_ADMIN_EMAILS?.split(',').map((e) => e.trim()) || [];

  if (!result.ok) {
    return (
      <div className="space-y-3 pt-2">
        <h1 className="text-2xl font-bold text-text-primary">参加者一覧</h1>
        <p className="text-sm text-error">一覧の取得に失敗しました。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-2">
      <header className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary">参加者一覧</h1>
          <p className="text-sm text-text-secondary">メール・訓練状況・権限・オプトアウト</p>
        </div>
        <Link 
          href="/admin/enroll" 
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 shadow-sm"
        >
          参加者を追加
        </Link>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-bg text-xs font-semibold text-text-secondary">
            <tr className="border-b border-border">
              <th className="px-4 py-3">メール</th>
              <th className="px-4 py-3">権限</th>
              <th className="px-4 py-3">最新状況</th>
              <th className="px-4 py-3">オプトアウト</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {result.value.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-bg/50">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${user.id}`} className="font-semibold text-text-primary hover:text-primary">
                    {user.email}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <UserRoleForm
                    userId={user.id}
                    initialRole={user.role}
                    isDisabled={adminEmails.includes(user.email)}
                  />
                </td>
                <td className="px-4 py-3 text-text-secondary">{user.latestStatus}</td>
                <td className="px-4 py-3 text-text-secondary font-medium">
                  {user.optedOut ? <span className="text-error">停止中</span> : <span className="text-success">有効</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
