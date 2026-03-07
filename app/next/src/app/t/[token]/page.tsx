import { redirect } from 'next/navigation';

import { createContainer } from '../../../_di/container.server';

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const c = createContainer();
  const result = await c.tracking.usecases.trackClick({ token });

  if (!result.ok) {
    redirect('/error/invalid-token');
  }

  redirect(`/learn/${result.value.drillId}?token=${encodeURIComponent(token)}`);
}
