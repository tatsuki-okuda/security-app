'use client';

import { Bot, Loader2 } from 'lucide-react';
import { useActionState, useEffect, startTransition } from 'react';

import type { QuizTemplateQuestion } from '../../drill/domain/quizTemplates';
import type { GenerateContentActionState } from '../contracts/generate';

type Props = {
  action: (prev: GenerateContentActionState, formData: FormData) => Promise<GenerateContentActionState>;
  scenarioType: string;
  userPrompt?: string;
  onGenerated: (data: {
    subject: string;
    body: string;
    guidanceText: string;
    ctaText: string;
    ctaUrlPlaceholder: string;
    riskNotes: string;
    quiz: QuizTemplateQuestion[];
  }) => void;
};

const initialState: GenerateContentActionState = { status: 'idle' };

export const AiGenerateButton = ({ action, scenarioType, userPrompt, onGenerated }: Props) => {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === 'success' && state.data) {
      onGenerated(state.data);
    }
  }, [state, onGenerated]);

  const disabled = isPending || !scenarioType;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (disabled) return;
    startTransition(() => {
      const formData = new FormData();
      formData.set('scenarioType', scenarioType);
      if (userPrompt) {
        formData.set('userPrompt', userPrompt);
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
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
        {isPending ? '生成中...' : 'AIに生成させる'}
      </button>
      {state.status === 'error' && state.formError && (
        <span className="ml-2 text-xs text-error">{state.formError}</span>
      )}
    </div>
  );
};
