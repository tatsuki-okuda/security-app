import Link from 'next/link';
import { notFound } from 'next/navigation';

import { createContainer } from '../../../../../_di/container.server';
import { EditDrillForm } from '../../../../../features/drill/_ui/EditDrillForm';

import { updateDrillAction } from './actions';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = createContainer();
  const result = await c.admin.usecases.getDrillDetail(id);

  if (!result.ok || !result.value) {
    notFound();
  }

  return (
    <main className="mx-auto mt-12 max-w-3xl space-y-4 px-4 sm:px-0 mb-12">
      <Link href={`/admin/drills/${id}`} className="text-sm font-semibold text-text-secondary">
        ← 詳細へ戻る
      </Link>
      <h1 className="text-2xl font-semibold text-text-primary">訓練・クイズの編集と配信</h1>
      <EditDrillForm drill={result.value} action={updateDrillAction} />
    </main>
  );
}
