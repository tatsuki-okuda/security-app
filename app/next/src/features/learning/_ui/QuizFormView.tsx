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
          <section key={question.id} className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Question {question.order}</p>
              <h2 className="text-lg font-semibold text-slate-900">{question.questionText}</h2>
            </div>

            <div className="mt-4 space-y-3">
              {question.options.map((option) => (
                <label key={option.id} className="flex items-start gap-3 text-sm text-slate-700">
                  <input
                    type={question.type === 'radio' ? 'radio' : 'checkbox'}
                    name={fieldKey}
                    value={option.id}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                  <span>
                    <span className="font-semibold text-slate-800">{option.label}</span> {option.optionText}
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
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>
      ) : null}

      {failedScore !== null ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          現在のスコアは {failedScore} 点です。80 点以上で合格です。
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
