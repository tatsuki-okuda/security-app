import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createContainer } from '../../../../_di/container.server';

import { StopDrillButton } from './_ui/StopDrillButton';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const c = createContainer();
  const { id } = await params;
  const result = await c.admin.usecases.getDrillDetail(id);

  if (!result.ok) {
    if (result.error.type === 'NOT_FOUND') {
      notFound();
    }

    return (
      <main className="mx-auto mt-12 max-w-4xl space-y-3 px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-text-primary">訓練詳細</h1>
        <p className="text-sm text-error">詳細の取得に失敗しました。</p>
      </main>
    );
  }

  const drill = result.value;

  return (
    <main className="mx-auto mt-12 max-w-5xl space-y-6 px-4 sm:px-0">
      <header className="space-y-4">
        <div>
          <Link href="/admin/drills" className="text-sm font-semibold text-text-secondary hover:text-text-primary transition">
            ← 一覧へ戻る
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-text-primary">訓練詳細</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                drill.status === 'delivering'
                  ? 'bg-indigo-100 text-indigo-700'
                  : drill.status === 'stopped'
                    ? 'bg-bg text-text-primary'
                    : drill.status === 'deliverable'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
              }`}
            >
              {drill.status === 'delivering'
                ? '配信中'
                : drill.status === 'stopped'
                  ? '配信停止'
                  : drill.status === 'deliverable'
                    ? '配信可能'
                    : '下書き'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {drill.status === 'delivering' && <StopDrillButton drillId={drill.id} />}

            {drill.status !== 'stopped' && (
              <Link
                href={`/admin/drills/${drill.id}/edit`}
                className="inline-flex items-center rounded-xl bg-surface px-4 py-2 text-sm font-semibold text-text-primary shadow-sm ring-1 ring-inset ring-slate-300 transition hover:bg-bg"
              >
                編集する
              </Link>
            )}
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm">
        <p className="text-sm text-text-secondary">訓練名: {drill.title}</p>
        <p className="text-sm text-text-secondary">状態: {drill.status}</p>
        <p className="text-sm text-text-secondary">チャネル: {drill.channel}</p>
        <p className="text-sm text-text-secondary">送信日: {drill.sentAt ? new Date(drill.sentAt).toLocaleString() : '-'}</p>
      </section>

      <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary">配信内容</h2>
        <p className="mt-2 text-sm text-text-secondary">件名: {drill.subject}</p>
        <div className="mt-3 whitespace-pre-wrap rounded-xl bg-bg p-4 text-sm text-text-primary">{drill.body}</div>
        <p className="mt-3 text-sm text-text-secondary">誘導テキスト</p>
        <div className="mt-2 whitespace-pre-wrap rounded-xl bg-bg p-4 text-sm text-text-primary">
          {drill.guidanceText}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary">クイズ内容</h2>
        <div className="mt-4 space-y-4">
          {drill.quizQuestions.map((question) => (
            <div key={question.id} className="rounded-xl border border-border p-4">
              <p className="font-semibold text-text-primary">{question.questionText}</p>
              <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                {question.options.map((opt) => (
                  <li key={`${question.id}-${opt.label}`}>
                    {opt.label}. {opt.optionText} {opt.isCorrect ? '（正解）' : ''}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-text-secondary">解説: {question.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary">行動ログ</h2>
        <ul className="mt-3 space-y-2 text-sm text-text-secondary">
          {drill.interactions.map((interaction, idx) => (
            <li key={`${interaction.type}-${idx}`}>
              {interaction.type} - {new Date(interaction.occurredAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary">クイズ結果</h2>
        <ul className="mt-3 space-y-2 text-sm text-text-secondary">
          {drill.quizAttempts.map((attempt, idx) => (
            <li key={`${attempt.score}-${idx}`}>
              スコア: {attempt.score} 点 / {attempt.isPassed ? '合格' : '不合格'}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
