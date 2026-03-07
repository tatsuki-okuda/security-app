import { redirect } from 'next/navigation';

import { createContainer } from '../../../_di/container.server';
import { LearningIntroView } from '../../../features/learning/_ui';

export default async function Page(props: {
  params: Promise<{ drillId: string }>;
  searchParams?: Promise<{ token?: string }>;
}) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  
  const { drillId } = params;
  const c = createContainer();
  const result = await c.learning.usecases.getIntro({ drillId });

  if (!result.ok) {
    redirect('/error/invalid-token');
  }

  if (searchParams?.token) {
    await c.learning.usecases.recordLearning({ drillId, token: searchParams.token });
  }

  return (
    <LearningIntroView
      drillId={result.value.drillId}
      title={result.value.title}
      guidanceText={result.value.guidanceText}
      token={searchParams?.token}
    />
  );
}
