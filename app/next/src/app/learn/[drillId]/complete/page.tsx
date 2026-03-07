import { redirect } from 'next/navigation';

import { createContainer } from '../../../../_di/container.server';

export default async function Page(props: {
  params: Promise<{ drillId: string }>;
  searchParams?: Promise<{ token?: string }>;
}) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  
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
      <h1 className="text-2xl font-semibold text-text-primary">学習完了</h1>
      <p className="text-sm text-text-secondary">合格おめでとうございます。今回の学習は完了です。</p>

      <div className="rounded-2xl border border-border bg-surface/80 p-6 text-sm text-text-primary shadow-sm">
        <p className="font-semibold text-text-primary">最終スコア: {result.value.score} 点</p>
        <p>受験回数: {result.value.attemptCount} 回</p>
      </div>

      {result.value.feedback ? (
        <div className="space-y-4">
          <section className="rounded-2xl border border-indigo-200 bg-surface/80 p-6 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-indigo-900">
              <span className="text-2xl">✨</span> 学習総評
            </h2>
            <p className="text-sm leading-relaxed text-indigo-950">{result.value.feedback.overallFeedback}</p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            {result.value.feedback.strengths.length > 0 && (
              <section className="rounded-2xl border border-teal-100 bg-teal-50 p-5 shadow-sm">
                <h3 className="mb-2 font-semibold text-teal-800">✅ 習得できたこと・強み</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-teal-900">
                  {result.value.feedback.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </section>
            )}

            {result.value.feedback.improvements.length > 0 && (
              <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
                <h3 className="mb-2 font-semibold text-amber-800">🎯 今後の改善ポイント</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-amber-900">
                  {result.value.feedback.improvements.map((imp, i) => (
                    <li key={i}>{imp}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {result.value.feedback.advice.length > 0 && (
            <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
              <h3 className="mb-2 font-semibold text-blue-800">📚 次のステップへのアドバイス</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-blue-900">
                {result.value.feedback.advice.map((adv, i) => (
                  <li key={i}>{adv}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : (
        <section className="rounded-2xl border border-border bg-bg p-6 text-sm text-text-secondary">
          次回の訓練でもポイントを意識して、日々の業務に取り組んでください。
        </section>
      )}
    </main>
  );
}
