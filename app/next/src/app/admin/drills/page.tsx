import Link from 'next/link';

import { createContainer } from '../../../_di/container.server';
import { scenarios } from '../../../features/drill/domain/scenarios';

export default async function Page() {
  const c = createContainer();
  const result = await c.admin.usecases.listDrills();

  if (!result.ok) {
    return (
      <main className="mx-auto mt-12 max-w-4xl space-y-3 px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-slate-900">訓練一覧</h1>
        <p className="text-sm text-rose-600">一覧の取得に失敗しました。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-12 max-w-5xl space-y-6 px-4 sm:px-0">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">訓練一覧</h1>
        <Link href="/admin/drills/create" className="text-sm font-semibold text-slate-700">
          新規作成
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/80">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">訓練名</th>
              <th className="px-4 py-3">シナリオ</th>
              <th className="px-4 py-3">状態</th>
              <th className="px-4 py-3">チャネル</th>
              <th className="px-4 py-3">送信日</th>
              <th className="px-4 py-3">対象者</th>
              <th className="px-4 py-3">クリック</th>
              <th className="px-4 py-3">合格</th>
            </tr>
          </thead>
          <tbody>
            {result.value.map((drill) => (
              <tr key={drill.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <Link href={`/admin/drills/${drill.id}`} className="font-semibold text-slate-800">
                    {drill.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {scenarios.find((s) => s.value === drill.scenarioId)?.label ?? drill.scenarioId}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                  {drill.status === 'draft' && '下書き'}
                  {drill.status === 'deliverable' && '配信可能'}
                  {drill.status === 'delivering' && '配信中'}
                  {drill.status === 'sent' && '送信済'}
                  {drill.status === 'failed' && '失敗'}
                  {drill.status === 'stopped' && '配信停止'}
                  {!['draft', 'deliverable', 'delivering', 'sent', 'failed', 'stopped'].includes(drill.status) &&
                    drill.status}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {drill.channel === 'email'
                    ? 'メール'
                    : drill.channel === 'slack'
                      ? 'Slack'
                      : drill.channel === 'both'
                        ? '両方'
                        : drill.channel}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {drill.sentAt ? new Date(drill.sentAt).toLocaleString() : '-'}
                </td>
                <td className="px-4 py-3 text-slate-600">{drill.recipientCount}</td>
                <td className="px-4 py-3 text-slate-600">{drill.clickCount}</td>
                <td className="px-4 py-3 text-slate-600">{drill.passCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
