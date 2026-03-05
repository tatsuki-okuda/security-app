'use client';

import { useActionState, useState } from 'react';

import { generateContentAction } from '../../../app/admin/drills/create/generateContentAction';
import { AiGenerateButton } from '../../llm/_ui/AiGenerateButton';

import type { CreateDrillActionState } from '../contracts/createDrill';
import type { QuizTemplateQuestion } from '../domain/quizTemplates';
import type { Scenario } from '../domain/scenarios';

type Props = {
  action: (prev: CreateDrillActionState, formData: FormData) => Promise<CreateDrillActionState>;
  scenarios: Scenario[];
};

const initialState: CreateDrillActionState = { status: 'idle' };

export const CreateDrillForm = ({ action, scenarios }: Props) => {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const fieldErrors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};

  const [scenarioType, setScenarioType] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [guidanceText, setGuidanceText] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrlPlaceholder, setCtaUrlPlaceholder] = useState('');
  const [riskNotes, setRiskNotes] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizTemplateQuestion[]>([]);

  // どのアクションボタンが押されたかを判定するためのstate
  const [submitActionType, setSubmitActionType] = useState<'draft' | 'deliverable' | 'delivering'>('draft');

  const handleAiGenerated = (data: {
    subject: string;
    body: string;
    guidanceText: string;
    ctaText: string;
    ctaUrlPlaceholder: string;
    riskNotes: string;
    quiz: QuizTemplateQuestion[];
  }) => {
    setSubject(data.subject);
    setBody(data.body);
    setGuidanceText(data.guidanceText);
    setCtaText(data.ctaText);
    setCtaUrlPlaceholder(data.ctaUrlPlaceholder);
    setRiskNotes(data.riskNotes);
    setQuizQuestions(data.quiz);
  };

  return (
    <form action={formAction} className="space-y-6">
      <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">訓練名</label>
            <input name="title" className="w-full rounded-xl border border-border px-4 py-2 text-sm" />
            {fieldErrors.title?.map((msg) => (
              <p key={msg} className="text-xs text-error">
                {msg}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">シナリオ</label>
            <select
              name="scenarioType"
              value={scenarioType}
              onChange={(e) => setScenarioType(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2 text-sm"
            >
              <option value="">選択してください</option>
              {scenarios.map((scenario) => (
                <option key={scenario.value} value={scenario.value}>
                  {scenario.label}
                </option>
              ))}
            </select>
            {fieldErrors.scenarioType?.map((msg) => (
              <p key={msg} className="text-xs text-error">
                {msg}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">配信チャネル</label>
            <select name="channel" className="w-full rounded-xl border border-border px-4 py-2 text-sm">
              <option value="email">メール</option>
              <option value="slack">Slack</option>
              <option value="both">メール + Slack</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">メール文面</h2>
            <AiGenerateButton
              action={generateContentAction}
              scenarioType={scenarioType}
              onGenerated={handleAiGenerated}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">件名</label>
            <input
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2 text-sm"
            />
            {fieldErrors.subject?.map((msg) => (
              <p key={msg} className="text-xs text-error">
                {msg}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">本文</label>
            <textarea
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-border px-4 py-2 text-sm"
            />
            {fieldErrors.body?.map((msg) => (
              <p key={msg} className="text-xs text-error">
                {msg}
              </p>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">誘導テキスト</label>
            <textarea
              name="guidanceText"
              value={guidanceText}
              onChange={(e) => setGuidanceText(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border px-4 py-2 text-sm"
            />
            {fieldErrors.guidanceText?.map((msg) => (
              <p key={msg} className="text-xs text-error">
                {msg}
              </p>
            ))}
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-1/2 space-y-2">
                <label className="text-sm font-semibold text-text-primary">リンクテキスト（CTA）</label>
                <input
                  name="ctaText"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-2 text-sm"
                  placeholder="例: パスワードの再設定はこちら"
                />
              </div>
              <div className="w-1/2 space-y-2">
                <label className="text-sm font-semibold text-text-primary">リンクURL（プレースホルダ）</label>
                <input
                  name="ctaUrlPlaceholder"
                  value={ctaUrlPlaceholder}
                  onChange={(e) => setCtaUrlPlaceholder(e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-2 text-sm bg-bg"
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-text-primary">リスク解説メモ（非公開）</label>
              <textarea
                name="riskNotes"
                value={riskNotes}
                onChange={(e) => setRiskNotes(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-border px-4 py-2 text-sm text-text-secondary bg-bg"
              />
            </div>
          </div>
        </div>
      </section>

      {quizQuestions.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">生成されたクイズ問題 ({quizQuestions.length}問)</h2>
          <div className="space-y-4">
            {quizQuestions.map((q, i) => (
              <div key={i} className="rounded-xl border border-border p-4 space-y-2">
                <p className="font-semibold text-sm text-text-primary">
                  Q{q.order}. {q.questionText}
                </p>
                <div className="pl-4 space-y-1">
                  {q.options.map((opt, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className={opt.isCorrect ? 'font-bold text-emerald-600' : ''}>
                        {opt.label}. {opt.optionText} {opt.isCorrect && '（正解）'}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-text-secondary mt-2 bg-bg p-2 rounded">解説: {q.explanation}</p>
              </div>
            ))}
          </div>
          <input type="hidden" name="quizQuestions" value={JSON.stringify(quizQuestions)} />
        </section>
      )}

      {state.status === 'error' && state.formError ? (
        <div className="rounded-xl border border-rose-100 bg-error px-4 py-3 text-sm text-rose-700">
          {state.formError}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <input type="hidden" name="actionType" value={submitActionType} />
        <button
          type="submit"
          onClick={() => setSubmitActionType('draft')}
          disabled={isPending}
          className="inline-flex items-center rounded-xl bg-surface px-5 py-3 text-sm font-semibold text-text-primary shadow-sm ring-1 ring-inset ring-slate-300 transition hover:bg-bg disabled:opacity-70"
        >
          {isPending && submitActionType === 'draft' ? '保存中…' : '下書き保存'}
        </button>
        <button
          type="submit"
          onClick={() => setSubmitActionType('deliverable')}
          disabled={isPending}
          className="inline-flex items-center rounded-xl bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:opacity-70"
        >
          {isPending && submitActionType === 'deliverable' ? '処理中…' : '配信可能にする'}
        </button>
        <button
          type="submit"
          onClick={() => setSubmitActionType('delivering')}
          disabled={isPending}
          className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-70"
        >
          {isPending && submitActionType === 'delivering' ? '送信中…' : 'いますぐ配信'}
        </button>
      </div>
    </form>
  );
};
