'use client';

import { useActionState } from 'react';

import { QuizFormView } from './QuizFormView';

import type { QuizViewQuestion } from '../usecases/GetQuizUseCase';
import type { QuizActionState } from '../contracts/quiz';

type Props = {
  questions: QuizViewQuestion[];
  token: string;
  drillId: string;
  action: (prev: QuizActionState, formData: FormData) => Promise<QuizActionState>;
};

const initialState: QuizActionState = { status: 'idle' };

export const QuizForm = ({ questions, token, drillId, action }: Props) => {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <QuizFormView
      questions={questions}
      action={formAction}
      state={state}
      token={token}
      drillId={drillId}
      isPending={isPending}
    />
  );
};
