import { InlineError } from '../../../shared/ui/components/InlineError';

import type { QuizActionState } from '../contracts/quiz';
import type { QuizViewQuestion } from '../usecases/GetQuizUseCase';

type Props = {
  questions: QuizViewQuestion[];
  action: (formData: FormData) => void;
  state: QuizActionState;
  token: string;
  drillId: string;
  isPending: boolean;
};

export const QuizFormView = ({ questions, action, state, token, drillId, isPending }: Props) => {
  const formError = state.status === 'error' ? state.formError : undefined;
  const failedScore = state.status === 'failed' ? state.score : null;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="drillId" value={drillId} />

      {questions.map((question) => {
        const fieldKey = `q_${question.id}`;
        const fieldErrors = state.status === 'error' ? (state.fieldErrors?.[fieldKey] ?? []) : [];

        return (
          <section key={question.id} className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Question {question.order}</p>
              <h2 className="text-lg font-semibold text-text-primary">{question.questionText}</h2>
            </div>

            <div className="mt-4 space-y-3">
              {question.options.map((option) => (
                <label key={option.id} className="flex items-start gap-3 text-sm text-text-primary">
                  <input
                    type={question.type === 'radio' ? 'radio' : 'checkbox'}
                    name={fieldKey}
                    value={option.id}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-text-primary"
                  />
                  <span>
                    <span className="font-semibold text-text-primary">{option.label}</span> {option.optionText}
                  </span>
                </label>
              ))}
            </div>

            <InlineError messages={fieldErrors} className="mt-3 space-y-2 text-sm" />

            {state.status === 'failed' && state.explanations[question.id] ? (
              <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                解説: {state.explanations[question.id]}
              </div>
            ) : null}
          </section>
        );
      })}

      {formError ? (
        <div className="rounded-xl border border-rose-100 bg-error px-4 py-3 text-sm text-rose-700">{formError}</div>
      ) : null}

      {failedScore !== null ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-rose-200 bg-error px-5 py-4 text-rose-800 shadow-sm">
            <h3 className="mb-1 text-base font-bold">不合格です (スコア: {failedScore}点)</h3>
            <p className="text-sm">80点以上で合格となります。以下のフィードバックを参考に、再度挑戦してください。</p>
          </div>

          {state.status === 'failed' && state.feedback ? (
            <div className="space-y-4 rounded-2xl border border-indigo-100 bg-surface/60 p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-indigo-900">
                <span className="text-xl">💡</span> AI 学習フィードバック
              </h3>

              {state.feedback.strengths.length > 0 && (
                <div className="space-y-2 rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-900">
                  <p className="font-semibold text-teal-700">✅ よくできている点</p>
                  <ul className="list-inside list-disc space-y-1">
                    {state.feedback.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {state.feedback.improvements.length > 0 && (
                <div className="space-y-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <p className="font-semibold text-amber-700">🎯 改善のポイント</p>
                  <ul className="list-inside list-disc space-y-1">
                    {state.feedback.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {state.feedback.advice.length > 0 && (
                <div className="space-y-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
                  <p className="font-semibold text-indigo-700">📚 次の学習へのアドバイス</p>
                  <ul className="list-inside list-disc space-y-1">
                    {state.feedback.advice.map((adv, i) => (
                      <li key={i}>{adv}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-70"
        >
          {isPending ? '採点中…' : '回答を送信'}
        </button>
      </div>
    </form>
  );
};
