'use client';

import { useActionState, useState, useCallback } from 'react';

import { generateContentAction } from '../../../app/admin/drills/create/generateContentAction';
import { reviseContentAction } from '../../../app/admin/drills/create/reviseContentAction';
import { AiGenerateButton } from '../../llm/_ui/AiGenerateButton';
import { AiReviseButton } from '../../llm/_ui/AiReviseButton';
import { MAX_USER_PROMPT_LENGTH } from '../../llm/domain/userPromptValidation';

import type { CreateDrillActionState } from '../contracts/createDrill';
import type { Scenario } from '../domain/scenarios';
import type { UserListItem } from '../../admin/usecases/gateway/AdminRepository';

type Props = {
  action: (prev: CreateDrillActionState, formData: FormData) => Promise<CreateDrillActionState>;
  scenarios: Scenario[];
  users: UserListItem[];
};

const initialState: CreateDrillActionState = { status: 'idle' };

export const CreateDrillForm = ({ action, scenarios, users }: Props) => {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const fieldErrors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};

  const [targetType, setTargetType] = useState<'all' | 'specific' | 'random'>('all');
  const [targetCount, setTargetCount] = useState<number | ''>('');
  const [targetUserIds, setTargetUserIds] = useState<string[]>([]);
  const [scenarioType, setScenarioType] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [guidanceText, setGuidanceText] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaUrlPlaceholder, setCtaUrlPlaceholder] = useState('');
  const [riskNotes, setRiskNotes] = useState('');
  
  const [userPrompt, setUserPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [bodyQualityWarning, setBodyQualityWarning] = useState('');
  const [generateError, setGenerateError] = useState<string | null>(null);

  const handleAiGenerated = useCallback((data: {
    subject: string;
    body: string;
    guidanceText: string;
    ctaText: string;
    ctaUrlPlaceholder: string;
    riskNotes: string;
    bodyQualityWarning?: string;
  }) => {
    setSubject(data.subject);
    setBody(data.body);
    setGuidanceText(data.guidanceText);
    setCtaText(data.ctaText);
    setCtaUrlPlaceholder(data.ctaUrlPlaceholder);
    setRiskNotes(data.riskNotes);
    setBodyQualityWarning(data.bodyQualityWarning ?? '');
    setEditPrompt(''); // 生成し直した場合は編集プロンプトをクリア
  }, []);

  const handleAiRevised = useCallback((data: {
    subject: string;
    body: string;
    guidanceText: string;
    ctaText: string;
    ctaUrlPlaceholder: string;
    riskNotes: string;
  }) => {
    setSubject(data.subject);
    setBody(data.body);
    setGuidanceText(data.guidanceText);
    setCtaText(data.ctaText);
    setCtaUrlPlaceholder(data.ctaUrlPlaceholder);
    setRiskNotes(data.riskNotes);
    setBodyQualityWarning(''); // 再編集後は警告をクリア
    setEditPrompt(''); // 完了後にプロンプトをクリア
  }, []);

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
        <h2 className="text-lg font-semibold text-text-primary mb-4">配信対象</h2>
        <div className="space-y-4">
          <input type="hidden" name="targetUserIds" value={JSON.stringify(targetUserIds)} />
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">対象者</label>
            <div className="flex flex-wrap items-center gap-6 mt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="all"
                  checked={targetType === 'all'}
                  onChange={() => setTargetType('all')}
                  className="w-4 h-4 text-emerald-600 border-border focus:ring-emerald-600"
                />
                全員に送信
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="specific"
                  checked={targetType === 'specific'}
                  onChange={() => setTargetType('specific')}
                  className="w-4 h-4 text-emerald-600 border-border focus:ring-emerald-600"
                />
                特定の個人
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="targetType"
                  value="random"
                  checked={targetType === 'random'}
                  onChange={() => setTargetType('random')}
                  className="w-4 h-4 text-emerald-600 border-border focus:ring-emerald-600"
                />
                ランダム選出
              </label>
            </div>
            {fieldErrors.targetType?.map((msg) => (
              <p key={msg} className="text-xs text-error">{msg}</p>
            ))}
          </div>

          {targetType === 'specific' && (
            <div className="space-y-3 pl-6 border-l-2 border-slate-200 py-1">
              <label className="text-sm font-semibold text-text-primary">
                対象ユーザー ({targetUserIds.length}名選択中)
              </label>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-border p-3 space-y-2">
                {users?.map((user) => (
                  <label key={user.id} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-slate-50/10 p-1 rounded transition-colors border border-transparent hover:border-border/50">
                    <input
                      type="checkbox"
                      checked={targetUserIds.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetUserIds([...targetUserIds, user.id]);
                        } else {
                          setTargetUserIds(targetUserIds.filter(id => id !== user.id));
                        }
                      }}
                      className="rounded border-border text-emerald-600 focus:ring-emerald-600"
                    />
                    <div className="flex flex-col">
                      <span className="font-medium text-text-secondary">{user.email}</span>
                      {user.role === 'admin' && <span className="text-xs text-blue-500">管理者</span>}
                    </div>
                  </label>
                ))}
              </div>
              {fieldErrors.targetUserIds?.map((msg) => (
                <p key={msg} className="text-xs text-error">{msg}</p>
              ))}
            </div>
          )}

          {targetType === 'random' && (
            <div className="space-y-2 pl-6 border-l-2 border-slate-200 py-1">
              <label className="text-sm font-semibold text-text-primary">ランダム選出する人数</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="targetCount"
                  min="1"
                  value={targetCount}
                  onChange={(e) => setTargetCount(e.target.value ? Number(e.target.value) : '')}
                  className="w-24 rounded-xl border border-border px-4 py-2 text-sm text-right"
                />
                <span className="text-sm text-text-secondary">人</span>
              </div>
              {fieldErrors.targetCount?.map((msg) => (
                <p key={msg} className="text-xs text-error">{msg}</p>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-semibold text-text-primary">メール文面</h2>
              <textarea
                value={userPrompt}
                onChange={(e) => {
                  setUserPrompt(e.target.value);
                  setGenerateError(null);
                }}
                placeholder="AIへの追加指示（例: もっと緊急性を煽って、社長になりすまして 等）"
                rows={2}
                maxLength={MAX_USER_PROMPT_LENGTH}
                className="w-full rounded-xl border border-border px-4 py-2 text-sm text-text-secondary bg-surface"
                aria-describedby="user-prompt-hint"
                aria-invalid={!!generateError}
                aria-errormessage={generateError ? 'generate-error' : undefined}
              />
              <p id="user-prompt-hint" className="text-xs text-text-secondary">
                {MAX_USER_PROMPT_LENGTH}文字以内。差出人・トーン・文体などのスタイル指示のみ入力してください。生成後に本文に不適切な表現が含まれていると警告が表示されます。
              </p>
              {generateError && (
                <p id="generate-error" role="alert" className="text-xs text-error">
                  {generateError}
                </p>
              )}
            </div>
            <div className="pt-8">
              <AiGenerateButton
                action={generateContentAction}
                scenarioType={scenarioType}
                userPrompt={userPrompt}
                onGenerated={handleAiGenerated}
                onError={setGenerateError}
              />
            </div>
          </div>

          {bodyQualityWarning && (
            <div
              role="alert"
              className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {bodyQualityWarning}
            </div>
          )}
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

          {(subject || body) && (
            <div className="mt-6 border-t border-border pt-6 space-y-4">
              <h3 className="text-sm font-semibold text-text-primary">生成した文面の再編集</h3>
              <div className="flex items-start gap-4">
                <textarea
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="修正指示を入力（例: もっと丁寧な口調に直して、短くして 等）"
                  rows={2}
                  className="flex-1 rounded-xl border border-border px-4 py-2 text-sm text-text-secondary bg-surface"
                />
                <AiReviseButton
                  action={reviseContentAction}
                  editPrompt={editPrompt}
                  currentData={{
                    subject,
                    body,
                    ctaText,
                    ctaUrlPlaceholder,
                    guidanceText,
                    riskNotes,
                  }}
                  onRevised={handleAiRevised}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {state.status === 'error' && state.formError ? (
        <div className="rounded-xl border border-rose-100 bg-error px-4 py-3 text-sm text-rose-700">
          {state.formError}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <input type="hidden" name="actionType" value="draft" />
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-70"
        >
          {isPending ? '保存中…' : '同意して保存（次へ）'}
        </button>
      </div>
    </form>
  );
};
