'use client';

import { useActionState } from 'react';

import type { CreateDrillActionState } from '../contracts/createDrill';
import type { Scenario } from '../domain/scenarios';

type Props = {
  action: (prev: CreateDrillActionState, formData: FormData) => Promise<CreateDrillActionState>;
  scenarios: Scenario[];
};

const initialState: CreateDrillActionState = { status: 'idle' };

export const CreateDrillForm = ({ action, scenarios }: Props) => {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const fieldErrors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">訓練名</label>
            <input name="title" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" />
            {fieldErrors.title?.map((msg) => (
              <p key={msg} className="text-xs text-rose-600">
                {msg}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">シナリオ</label>
            <select name="scenarioType" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm">
              <option value="">選択してください</option>
              {scenarios.map((scenario) => (
                <option key={scenario.value} value={scenario.value}>
                  {scenario.label}
                </option>
              ))}
            </select>
            {fieldErrors.scenarioType?.map((msg) => (
              <p key={msg} className="text-xs text-rose-600">
                {msg}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">配信チャネル</label>
            <select name="channel" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm">
              <option value="email">メール</option>
              <option value="slack">Slack</option>
              <option value="both">メール + Slack</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">件名</label>
            <input name="subject" className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" />
            {fieldErrors.subject?.map((msg) => (
              <p key={msg} className="text-xs text-rose-600">
                {msg}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">本文</label>
            <textarea name="body" rows={6} className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm" />
            {fieldErrors.body?.map((msg) => (
              <p key={msg} className="text-xs text-rose-600">
                {msg}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">誘導テキスト</label>
            <textarea
              name="guidanceText"
              rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm"
            />
            {fieldErrors.guidanceText?.map((msg) => (
              <p key={msg} className="text-xs text-rose-600">
                {msg}
              </p>
            ))}
          </div>
        </div>
      </section>

      {state.status === 'error' && state.formError ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.formError}
        </div>
      ) : null}

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-70"
        >
          {isPending ? '送信中…' : '作成して配信'}
        </button>
      </div>
    </form>
  );
};
