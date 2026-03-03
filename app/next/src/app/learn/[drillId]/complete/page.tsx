import { redirect } from 'next/navigation';

import { createContainer } from '../../../../_di/container.server';

export default async function Page({
  params,
  searchParams,
}: {
  params: { drillId: string };
  searchParams?: { token?: string };
}) {
  const token = searchParams?.token ?? '';
  if (!token) {
    redirect('/error/invalid-token');
  }

  const c = createContainer();
  const result = await c.learning.usecases.getQuizResult({ drillId: params.drillId, token });

  if (!result.ok) {
    redirect(`/learn/${params.drillId}/quiz?token=${encodeURIComponent(token)}`);
  }

  return (
    <main className="mx-auto mt-12 max-w-2xl space-y-4 px-4 sm:px-0">
      <h1 className="text-2xl font-semibold text-slate-900">学習完了</h1>
      <p className="text-sm text-slate-600">合格おめでとうございます。今回の学習は完了です。</p>

      <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-700 shadow-sm">
        <p className="font-semibold text-slate-800">最終スコア: {result.value.score} 点</p>
        <p>受験回数: {result.value.attemptCount} 回</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        フィードバックは準備中です。次回の訓練でもポイントを意識してください。
      </section>
    </main>
  );
}
