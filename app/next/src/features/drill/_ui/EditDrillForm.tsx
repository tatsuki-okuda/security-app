'use client';

import { Plus, Trash2, Sparkles, Bot, Send } from 'lucide-react';
import { useActionState, useState, useCallback } from 'react';

import { generateContentAction } from '../../../app/admin/drills/create/generateContentAction';
import { generateQuizAction } from '../../../app/admin/drills/create/generateQuizAction';
import { reviseContentAction } from '../../../app/admin/drills/create/reviseContentAction';
import { AiGenerateButton } from '../../llm/_ui/AiGenerateButton';
import { AiGenerateQuizButton } from '../../llm/_ui/AiGenerateQuizButton';
import { AiReviseButton } from '../../llm/_ui/AiReviseButton';
import { MAX_USER_PROMPT_LENGTH } from '../../llm/domain/userPromptValidation';

import type { UserListItem, DrillDetail } from '../../admin/usecases/gateway/AdminRepository';
import type { UpdateDrillActionState } from '../contracts/updateDrill';
import type { QuizTemplateQuestion } from '../domain/quizTemplates';

type Props = {
  drill: DrillDetail;
  action: (prev: UpdateDrillActionState, formData: FormData) => Promise<UpdateDrillActionState>;
  users: UserListItem[];
};

const initialState: UpdateDrillActionState = { status: 'idle' };

export const EditDrillForm = ({ drill, action, users }: Props) => {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const fieldErrors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};

  const [channel, setChannel] = useState(drill.channel);
  const [targetType, setTargetType] = useState(drill.targetType ?? 'all');
  const [targetCount, setTargetCount] = useState<number | ''>(drill.targetCount ?? '');
  const [targetUserIds, setTargetUserIds] = useState<string[]>(
    drill.targetUserIds ? (drill.targetUserIds as string[]) : []
  );
  const [subject, setSubject] = useState(drill.subject);
  const [body, setBody] = useState(drill.body);
  const [guidanceText, setGuidanceText] = useState(drill.guidanceText);

  // We only keep basic email fields, since riskNotes etc are not updating in DrillUseCase
  const [userPrompt, setUserPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [bodyQualityWarning, setBodyQualityWarning] = useState('');
  
  const [quizQuestions, setQuizQuestions] = useState<QuizTemplateQuestion[]>(
    drill.quizQuestions.map((q, idx) => ({
      order: idx,
      questionType: q.questionType as 'single_choice' | 'multiple_choice',
      questionText: q.questionText,
      explanation: q.explanation,
      options: q.options,
    }))
  );

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
    setBodyQualityWarning(data.bodyQualityWarning ?? '');
    setEditPrompt('');
  }, []);

  const handleAiRevised = useCallback((data: {
    subject: string;
    body: string;
    guidanceText: string;
  }) => {
    setSubject(data.subject);
    setBody(data.body);
    setGuidanceText(data.guidanceText);
    setBodyQualityWarning('');
    setEditPrompt('');
  }, []);

  const handleQuizGenerated = useCallback((data: { quiz: QuizTemplateQuestion[] }) => {
    setQuizQuestions((prev) => {
      // Avoid adding exact duplicates if the previous state already generated them
      const newQuestions = data.quiz.filter(
        (q) => !prev.some((p) => p.questionText === q.questionText)
      );
      if (newQuestions.length === 0) return prev;
      return [...prev, ...newQuestions];
    });
  }, []);

  const removeQuiz = (index: number) => {
    setQuizQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addManualQuiz = () => {
    const newQuiz: QuizTemplateQuestion = {
      order: quizQuestions.length,
      questionType: 'multiple_choice',
      questionText: '',
      explanation: '',
      options: [
        { label: 'A', optionText: '', isCorrect: true },
        { label: 'B', optionText: '', isCorrect: false },
        { label: 'C', optionText: '', isCorrect: false },
        { label: 'D', optionText: '', isCorrect: false },
      ],
    };
    setQuizQuestions([...quizQuestions, newQuiz]);
  };

  const updateQuiz = (index: number, updated: QuizTemplateQuestion) => {
    const newArr = [...quizQuestions];
    newArr[index] = updated;
    setQuizQuestions(newArr);
  };

  const actionButtons = (
    <div className="flex items-center justify-end gap-3">
      <button
        type="submit"
        name="actionType"
        value="draft"
        disabled={isPending}
        className="inline-flex items-center rounded-xl bg-surface px-5 py-3 text-sm font-semibold text-text-primary shadow-sm ring-1 ring-inset ring-slate-300 transition hover:bg-bg disabled:opacity-70"
      >
        保存
      </button>
      <button
        type="submit"
        name="actionType"
        value="deliverable"
        disabled={isPending}
        className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-70"
      >
        配信準備
      </button>
      <button
        type="submit"
        name="actionType"
        value="delivering"
        disabled={isPending || drill.status !== 'deliverable'}
        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <Send className="h-4 w-4" />
        配信する
      </button>
    </div>
  );

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="drillId" value={drill.id} />
      <input type="hidden" name="quizQuestions" value={JSON.stringify(quizQuestions)} />

      {/* 画面上部の操作ボタン群 */}
      {actionButtons}


      <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary mb-4">訓練基本情報</h2>
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">訓練名: {drill.title}</p>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary">配信チャネル</label>
            <select
              name="channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2 text-sm"
            >
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
                scenarioType={drill.scenarioId ?? ''}
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

          <div className="mt-6 border-t border-border pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">AIによる文面の再編集</h3>
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
                  ctaText: '', // Simplified
                  ctaUrlPlaceholder: '',
                  guidanceText,
                  riskNotes: '',
                }}
                onRevised={handleAiRevised}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary mb-4">クイズの作成・編集</h2>
        
        <div className="mb-6 space-y-4">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={addManualQuiz}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-sm hover:bg-bg transition"
            >
              <Plus className="h-4 w-4 text-text-secondary" />
              手動で追加
            </button>
            <AiGenerateQuizButton
              action={generateQuizAction}
              questionCount={1}
              label="AIで1問追加"
              loadingLabel="生成中..."
              icon={<Sparkles className="h-4 w-4 text-indigo-400" />}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-sm hover:bg-bg transition disabled:opacity-50"
              scenarioType={drill.scenarioId ?? ''}
              emailBody={body}
              onGenerated={handleQuizGenerated}
            />
            <AiGenerateQuizButton
              action={generateQuizAction}
              questionCount={3}
              label="クイズをAI一括生成"
              loadingLabel="生成中..."
              icon={<Bot className="h-4 w-4 text-green-500" />}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary shadow-sm hover:bg-bg transition disabled:opacity-50"
              scenarioType={drill.scenarioId ?? ''}
              emailBody={body}
              onGenerated={handleQuizGenerated}
            />
          </div>
          <p className="text-sm text-text-secondary">
            訓練メール本文に基づいたクイズ問題を作成します。AIで1問ずつ自動生成することもできます。
          </p>
        </div>

        {fieldErrors.quizQuestions?.map((msg) => (
          <p key={msg} className="mb-4 text-sm text-error font-medium">
            {msg}
          </p>
        ))}

        <div className="space-y-6">
          {quizQuestions.map((q, qIndex) => (
            <div key={qIndex} className="relative rounded-xl border border-border bg-bg p-4 shadow-sm">
              <button
                type="button"
                onClick={() => removeQuiz(qIndex)}
                className="absolute right-4 top-4 text-text-secondary hover:text-error transition"
              >
                <Trash2 className="h-5 w-5" />
              </button>

              <div className="space-y-4">
                <div className="space-y-2 pr-8">
                  <label className="text-sm font-semibold text-text-primary">問題文 {qIndex + 1}</label>
                  <textarea
                    value={q.questionText}
                    onChange={(e) => updateQuiz(qIndex, { ...q, questionText: e.target.value })}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                    rows={2}
                  />
                </div>

                <div className="space-y-3 pl-4">
                  <label className="text-sm font-semibold text-text-primary">選択肢</label>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-start gap-3">
                      <div className="flex pt-2">
                        <input
                          type="radio"
                          name={`correct-${qIndex}`}
                          checked={opt.isCorrect}
                          onChange={() => {
                            const newOptions = q.options.map((o, idx) => ({ ...o, isCorrect: idx === oIndex }));
                            updateQuiz(qIndex, { ...q, options: newOptions });
                          }}
                          className="h-4 w-4 text-slate-900 border-border focus:ring-slate-900"
                        />
                      </div>
                      <div className="flex-1 flex gap-2">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-surface text-sm font-semibold text-text-secondary border border-border">
                          {opt.label}
                        </span>
                        <input
                          value={opt.optionText}
                          onChange={(e) => {
                            const newOptions = [...q.options];
                            newOptions[oIndex].optionText = e.target.value;
                            updateQuiz(qIndex, { ...q, options: newOptions });
                          }}
                          className="w-full rounded-lg border border-border px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-sm font-semibold text-text-primary">解説</label>
                  <textarea
                    value={q.explanation}
                    onChange={(e) => updateQuiz(qIndex, { ...q, explanation: e.target.value })}
                    className="w-full rounded-xl border border-border px-3 py-2 text-sm text-text-secondary"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}

          {quizQuestions.length === 0 && (
            <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-text-tertiary">
              クイズ問題がありません。「AIでクイズを生成」または「手動で追加」してください。
            </div>
          )}
        </div>
      </section>

      {state.status === 'error' && state.formError && (
        <div className="rounded-xl border border-rose-100 bg-error px-4 py-3 text-sm text-rose-700">
          {state.formError}
        </div>
      )}

      {/* 画面下部の操作ボタン群 */}
      <div className="pt-4 border-t border-border mt-8">
        {actionButtons}
      </div>
    </form>
  );
};
