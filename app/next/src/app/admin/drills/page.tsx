import Link from 'next/link';

import { createContainer } from '../../../_di/container.server';
import { DrillTable } from '../../../features/drill/_ui/components/DrillTable';

export default async function Page() {
  const c = createContainer();
  const result = await c.admin.usecases.listDrills();

  if (!result.ok) {
    return (
      <main className="mx-auto mt-12 max-w-4xl space-y-3 px-4 sm:px-0">
        <h1 className="text-2xl font-semibold text-text-primary">訓練一覧</h1>
        <p className="text-sm text-error">一覧の取得に失敗しました。</p>
      </main>
    );
  }

  return (
    <main className="mx-auto mt-12 max-w-5xl space-y-6 px-4 sm:px-0">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">訓練一覧</h1>
        <Link href="/admin/drills/create" className="text-sm font-semibold text-text-primary">
          新規作成
        </Link>
      </header>

      <DrillTable drills={result.value} />
    </main>
  );
}
