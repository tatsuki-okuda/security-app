'use client';

import { Sparkles, Loader2 } from 'lucide-react';
import { useActionState, useEffect, startTransition } from 'react';

import type { ReviseContentActionState } from '../../../app/admin/drills/create/reviseContentAction';

type Props = {
  action: (prev: ReviseContentActionState, formData: FormData) => Promise<ReviseContentActionState>;
  editPrompt: string;
  currentData: {
    subject: string;
    body: string;
    ctaText: string;
    ctaUrlPlaceholder: string;
    guidanceText: string;
    riskNotes: string;
  };
  onRevised: (data: {
    subject: string;
    body: string;
    guidanceText: string;
    ctaText: string;
    ctaUrlPlaceholder: string;
    riskNotes: string;
  }) => void;
};

const initialState: ReviseContentActionState = { status: 'idle' };

export const AiReviseButton = ({ action, editPrompt, currentData, onRevised }: Props) => {
  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.status === 'success' && state.data) {
      onRevised(state.data);
    }
  }, [state, onRevised]);

  const disabled = isPending || !editPrompt;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (disabled) return;
    startTransition(() => {
      const formData = new FormData();
      formData.set('editPrompt', editPrompt);
      formData.set('currentSubject', currentData.subject);
      formData.set('currentBody', currentData.body);
      formData.set('currentCtaText', currentData.ctaText);
      formData.set('currentCtaUrlPlaceholder', currentData.ctaUrlPlaceholder);
      formData.set('currentGuidanceText', currentData.guidanceText);
      formData.set('currentRiskNotes', currentData.riskNotes);
      formAction(formData);
    });
  };

  return (
    <div className="inline-block flex-1 min-w-[200px]">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="w-full inline-flex justify-center items-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {isPending ? '推敲中...' : 'AIで再編集する'}
      </button>
      {state.status === 'error' && state.formError && (
        <p className="mt-1 text-xs text-error">{state.formError}</p>
      )}
    </div>
  );
};
