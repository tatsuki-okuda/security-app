type Props = {
  title: string;
  guidanceText: string;
  drillId: string;
  token?: string;
};

export const LearningIntroView = ({ title, guidanceText, drillId, token }: Props) => {
  const quizUrl = token ? `/learn/${drillId}/quiz?token=${encodeURIComponent(token)}` : `/learn/${drillId}/quiz`;
  return (
    <main className="mx-auto mt-12 max-w-3xl space-y-6 px-4 sm:px-0">
      <header className="space-y-2">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Security Training
        </span>
        <h1 className="text-3xl font-semibold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500">訓練ID: {drillId}</p>
      </header>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm leading-relaxed text-slate-700 shadow-sm">
        {guidanceText.split('\n').map((line, idx) => (
          <p key={`${line}-${idx}`} className="mb-3 last:mb-0">
            {line}
          </p>
        ))}
      </section>

      <section className="space-y-2 text-sm text-slate-600">
        <p>この後に簡単なクイズに進みます。落ち着いてポイントを確認しましょう。</p>
        <p className="font-semibold text-slate-800">準備ができたら「クイズへ進む」を押してください。</p>
      </section>

      <div>
        <a
          href={quizUrl}
          className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          クイズへ進む
        </a>
      </div>
    </main>
  );
};
