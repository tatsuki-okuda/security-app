'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useActionState, useState } from 'react';

import { generateQuizAction } from '../../../app/admin/drills/create/generateQuizAction';
import { reviseContentAction } from '../../../app/admin/drills/create/reviseContentAction';
import { AiGenerateQuizButton } from '../../llm/_ui/AiGenerateQuizButton';
import { AiReviseButton } from '../../llm/_ui/AiReviseButton';

import type { DrillDetail } from '../../admin/usecases/gateway/AdminRepository';
import type { UpdateDrillActionState } from '../contracts/updateDrill';
import type { QuizTemplateQuestion } from '../domain/quizTemplates';

type Props = {
  drill: DrillDetail;
  action: (prev: UpdateDrillActionState, formData: FormData) => Promise<UpdateDrillActionState>;
};

const initialState: UpdateDrillActionState = { status: 'idle' };

export const EditDrillForm = ({ drill, action }: Props) => {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const fieldErrors = state.status === 'error' ? (state.fieldErrors ?? {}) : {};

  const [channel, setChannel] = useState(drill.channel);
  const [subject, setSubject] = useState(drill.subject);
  const [body, setBody] = useState(drill.body);
  const [guidanceText, setGuidanceText] = useState(drill.guidanceText);

  // We only keep basic email fields, since riskNotes etc are not updating in DrillUseCase
  const [editPrompt, setEditPrompt] = useState('');
  
  const [quizQuestions, setQuizQuestions] = useState<QuizTemplateQuestion[]>(
    drill.quizQuestions.map((q, idx) => ({
      order: idx,
      questionType: q.questionType as 'single_choice' | 'multiple_choice',
      questionText: q.questionText,
      explanation: q.explanation,
      options: q.options,
    }))
  );

  const handleAiRevised = (data: {
    subject: string;
    body: string;
    guidanceText: string;
  }) => {
    setSubject(data.subject);
    setBody(data.body);
    setGuidanceText(data.guidanceText);
    setEditPrompt('');
  };

  const handleQuizGenerated = (data: { quiz: QuizTemplateQuestion[] }) => {
    setQuizQuestions((prev) => [...prev, ...data.quiz]);
  };

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

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="drillId" value={drill.id} />
      <input type="hidden" name="quizQuestions" value={JSON.stringify(quizQuestions)} />

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
        <h2 className="text-lg font-semibold text-text-primary mb-4">メール文面の編集</h2>
        <div className="space-y-4">
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
        
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-text-secondary">
            訓練メール本文に基づいたクイズ問題を作成します。AIで1問ずつ自動生成することもできます。
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addManualQuiz}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold text-text-primary shadow-sm hover:bg-bg transition"
            >
              <Plus className="h-4 w-4" />
              手動で追加
            </button>
            <AiGenerateQuizButton
              action={generateQuizAction}
              scenarioType={drill.scenarioId ?? ''}
              emailBody={body}
              onGenerated={handleQuizGenerated}
            />
          </div>
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

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="submit"
          name="actionType"
          value="draft"
          disabled={isPending}
          className="inline-flex items-center rounded-xl bg-surface px-5 py-3 text-sm font-semibold text-text-primary shadow-sm ring-1 ring-inset ring-slate-300 transition hover:bg-bg disabled:opacity-70"
        >
          下書きとして再度保存
        </button>
        <button
          type="submit"
          name="actionType"
          value="deliverable"
          disabled={isPending}
          className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-70"
        >
          配信可能（準備完了）にする
        </button>
        <button
          type="submit"
          name="actionType"
          value="delivering"
          disabled={isPending}
          className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-70"
        >
          すぐに配信を開始する
        </button>
      </div>
    </form>
  );
};
