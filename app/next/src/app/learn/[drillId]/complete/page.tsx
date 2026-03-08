import { redirect } from 'next/navigation';

import { createContainer } from '../../../../_di/container.server';
import { CompleteView } from '../../../../features/learning/_ui/components/CompleteView';

export default async function Page(props: {
  params: Promise<{ drillId: string }>;
  searchParams?: Promise<{ token?: string }>;
}) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  
  const token = searchParams?.token ?? '';
  if (!token) {
    redirect('/error/invalid-token');
  }

  const c = createContainer();
  const result = await c.learning.usecases.getQuizResult({ drillId: params.drillId, token });

  if (!result.ok) {
    redirect(`/learn/${params.drillId}/quiz?token=${encodeURIComponent(token)}`);
  }

  return <CompleteView result={result.value} />;
}
