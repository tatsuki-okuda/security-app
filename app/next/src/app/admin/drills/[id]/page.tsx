import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createContainer } from '../../../../_di/container.server';

export default async function Page({ params }: { params: { id: string } }) {
  const c = createContainer();
  const result = await c.admin.usecases.getDrillDetail(params.id);

  if (!result.ok) {
    if (result.error.type === 'NOT_FOUND') {
      notFound();
    }

    return (
      <main className="mx-auto mt-12 max-w-4xl space-y-3 px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-slate-900">訓練詳細</h1>
        <p className="text-sm text-rose-600">詳細の取得に失敗しました。</p>
      </main>
    );
  }

  const drill = result.value;

  return (
    <main className="mx-auto mt-12 max-w-5xl space-y-6 px-4 sm:px-0">
      <header className="space-y-2">
        <Link href="/admin/drills" className="text-sm font-semibold text-slate-500">
          ← 一覧へ戻る
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900">訓練詳細</h1>
          <Link href={`/admin/drills/${drill.id}/edit`} className="text-sm font-semibold text-slate-600">
            編集する
          </Link>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <p className="text-sm text-slate-600">訓練名: {drill.title}</p>
        <p className="text-sm text-slate-600">状態: {drill.status}</p>
        <p className="text-sm text-slate-600">チャネル: {drill.channel}</p>
        <p className="text-sm text-slate-600">送信日: {drill.sentAt ? new Date(drill.sentAt).toLocaleString() : '-'}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">配信内容</h2>
        <p className="mt-2 text-sm text-slate-600">件名: {drill.subject}</p>
        <div className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700">{drill.body}</div>
        <p className="mt-3 text-sm text-slate-600">誘導テキスト</p>
        <div className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          {drill.guidanceText}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">クイズ内容</h2>
        <div className="mt-4 space-y-4">
          {drill.quizQuestions.map((question) => (
            <div key={question.id} className="rounded-xl border border-slate-100 p-4">
              <p className="font-semibold text-slate-800">{question.questionText}</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                {question.options.map((opt) => (
                  <li key={`${question.id}-${opt.label}`}>
                    {opt.label}. {opt.optionText} {opt.isCorrect ? '（正解）' : ''}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-slate-500">解説: {question.explanation}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">行動ログ</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {drill.interactions.map((interaction, idx) => (
            <li key={`${interaction.type}-${idx}`}>
              {interaction.type} - {new Date(interaction.occurredAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">クイズ結果</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
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
