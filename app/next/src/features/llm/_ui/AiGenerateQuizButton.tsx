'use client';

import { Bot, Loader2 } from 'lucide-react';
import { useActionState, useEffect, startTransition } from 'react';

import type { QuizTemplateQuestion } from '../../drill/domain/quizTemplates';
import type { GenerateQuizActionState } from '../contracts/generate';

type Props = {
  action: (prev: GenerateQuizActionState, formData: FormData) => Promise<GenerateQuizActionState>;
  scenarioType: string;
  emailBody: string;
  userPrompt?: string;
  questionCount?: number;
  label?: string;
  loadingLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  onGenerated: (data: { quiz: QuizTemplateQuestion[] }) => void;
};

const initialState: GenerateQuizActionState = { status: 'idle' };

export const AiGenerateQuizButton = ({
  action,
  scenarioType,
  emailBody,
  userPrompt,
  questionCount,
  label,
  loadingLabel,
  icon,
  className,
  onGenerated,
}: Props) => {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === 'success' && state.data) {
      onGenerated(state.data);
    }
  }, [state, onGenerated]);

  const disabled = isPending || !emailBody;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (disabled) return;
    startTransition(() => {
      const formData = new FormData();
      if (scenarioType) {
        formData.set('scenarioType', scenarioType);
      }
      formData.set('emailBody', emailBody);
      if (userPrompt) {
        formData.set('userPrompt', userPrompt);
      }
      if (questionCount) {
        formData.set('questionCount', String(questionCount));
      }
      formAction(formData);
    });
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={
          className ||
          'inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-100 disabled:opacity-50'
        }
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (icon || <Bot className="h-4 w-4" />)}
        {isPending ? loadingLabel || 'クイズ生成中...' : label || 'クイズをAI生成'}
      </button>
      {state.status === 'error' && state.formError && (
        <span className="ml-2 pl-2 text-xs text-error">{state.formError}</span>
      )}
    </div>
  );
};
