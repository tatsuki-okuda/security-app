'use client';

import { Bot, Loader2 } from 'lucide-react';
import { useActionState, useEffect } from 'react';

import type { QuizTemplateQuestion } from '../../drill/domain/quizTemplates';
import type { GenerateContentActionState } from '../contracts/generate';

type Props = {
  action: (prev: GenerateContentActionState, formData: FormData) => Promise<GenerateContentActionState>;
  scenarioType: string;
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

export const AiGenerateButton = ({ action, scenarioType, onGenerated }: Props) => {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === 'success' && state.data) {
      onGenerated(state.data);
    }
  }, [state, onGenerated]);

  const disabled = isPending || !scenarioType;

  return (
    <form action={formAction} className="inline-block">
      <input type="hidden" name="scenarioType" value={scenarioType} />
      <button
        type="submit"
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
        {isPending ? '生成中...' : 'AIに生成させる'}
      </button>
      {state.status === 'error' && state.formError && (
        <span className="ml-2 text-xs text-rose-600">{state.formError}</span>
      )}
    </form>
  );
};
