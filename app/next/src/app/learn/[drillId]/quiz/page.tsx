import { redirect } from 'next/navigation';

import { createContainer } from '../../../../_di/container.server';
import { QuizForm } from '../../../../features/learning/_ui';

import { submitQuizAction } from './actions';

export default async function Page(props: {
  params: Promise<{ drillId: string }>;
  searchParams?: Promise<{ token?: string }>;
}) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;

  const { drillId } = params;
  const token = searchParams?.token ?? '';

  if (!token) {
    redirect('/error/invalid-token');
  }

  const c = createContainer();
  const result = await c.learning.usecases.getQuiz({ drillId });

  if (!result.ok) {
    redirect('/error/invalid-token');
  }

  return (
    <main className="mx-auto mt-12 max-w-3xl space-y-6 px-4 sm:px-0">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-text-primary">セキュリティクイズ</h1>
        <p className="text-sm text-text-secondary">すべての問題に回答してください。</p>
      </header>

      <QuizForm questions={result.value} token={token} drillId={drillId} action={submitQuizAction} />
    </main>
  );
}
