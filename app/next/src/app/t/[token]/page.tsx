import { redirect } from 'next/navigation';

import { createContainer } from '../../../_di/container.server';

export default async function Page({ params }: { params: { token: string } }) {
  const { token } = params;
  const c = createContainer();
  const result = await c.tracking.usecases.trackClick({ token });

  if (!result.ok) {
    redirect('/error/invalid-token');
  }

  redirect(`/learn/${result.value.drillId}?token=${encodeURIComponent(token)}`);
}
