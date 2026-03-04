import Link from 'next/link';

import { createContainer } from '../../../_di/container.server';
import { UserRoleForm } from '../../../features/admin/_ui/UserRoleForm';

export default async function Page() {
  const c = createContainer();
  const result = await c.admin.usecases.listUsers();

  const adminEmails = process.env.AUTH_ADMIN_EMAILS?.split(',').map((e) => e.trim()) || [];

  if (!result.ok) {
    return (
      <main className="mx-auto mt-12 max-w-3xl space-y-3 px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-slate-900">参加者一覧</h1>
        <p className="text-sm text-rose-600">一覧の取得に失敗しました。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-12 max-w-4xl space-y-6 px-4 sm:px-0">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">参加者一覧</h1>
        <Link href="/admin/enroll" className="text-sm font-semibold text-slate-700">
          参加者を追加
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">メール</th>
              <th className="px-4 py-3">権限</th>
              <th className="px-4 py-3">最新状況</th>
              <th className="px-4 py-3">オプトアウト</th>
            </tr>
          </thead>
          <tbody>
            {result.value.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <Link href={`/admin/users/${user.id}`} className="font-semibold text-slate-800">
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
                <td className="px-4 py-3 text-slate-600">{user.latestStatus}</td>
                <td className="px-4 py-3 text-slate-600">{user.optedOut ? '停止中' : '有効'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
