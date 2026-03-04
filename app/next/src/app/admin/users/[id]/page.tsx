import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createContainer } from '../../../../_di/container.server';
import { UserRoleForm } from '../../../../features/admin/_ui/UserRoleForm';

export default async function Page({ params }: { params: { id: string } }) {
  const c = createContainer();
  const result = await c.admin.usecases.getUserDetail(params.id);

  const adminEmails = process.env.AUTH_ADMIN_EMAILS?.split(',').map((e) => e.trim()) || [];

  if (!result.ok) {
    if (result.error.type === 'NOT_FOUND') {
      notFound();
    }

    return (
      <main className="mx-auto mt-12 max-w-4xl space-y-3 px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-slate-900">参加者詳細</h1>
        <p className="text-sm text-rose-600">詳細の取得に失敗しました。</p>
      </main>
    );
  }

  const user = result.value;

  return (
    <main className="mx-auto mt-12 max-w-4xl space-y-6 px-4 sm:px-0">
      <header className="space-y-2">
        <Link href="/admin/users" className="text-sm font-semibold text-slate-500">
          ← 一覧へ戻る
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">参加者詳細</h1>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <span className="w-24 font-semibold">メール:</span> {user.email}
        </p>
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <span className="w-24 font-semibold">権限:</span>
          <UserRoleForm userId={user.id} initialRole={user.role} isDisabled={adminEmails.includes(user.email)} />
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <span className="w-24 font-semibold">Slack:</span> {user.slackUserId ?? '未登録'}
        </p>
        <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <span className="w-24 font-semibold">オプトアウト:</span> {user.optedOut ? '停止中' : '有効'}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">訓練履歴</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">訓練</th>
                <th className="px-4 py-3">送信日</th>
                <th className="px-4 py-3">クリック</th>
                <th className="px-4 py-3">合格</th>
              </tr>
            </thead>
            <tbody>
              {user.drills.map((drill) => (
                <tr key={drill.drillId} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <Link href={`/admin/drills/${drill.drillId}`} className="font-semibold text-slate-800">
                      {drill.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {drill.sentAt ? new Date(drill.sentAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{drill.clickedAt ? 'クリック済み' : '未クリック'}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {drill.passed === null ? '未受験' : drill.passed ? `合格 (${drill.latestScore}点)` : '不合格'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
