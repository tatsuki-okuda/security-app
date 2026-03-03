import { CreateDrillForm } from '../../../../features/drill/_ui/CreateDrillForm';
import { scenarios } from '../../../../features/drill/domain/scenarios';

import { createDrillAction } from './actions';

export default function Page() {
  return (
    <main className="mx-auto mt-12 max-w-3xl space-y-6 px-4 sm:px-0">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">訓練作成</h1>
        <p className="text-sm text-slate-600">
          MVPでは固定シナリオと固定クイズを使用します。配信内容を入力してください。
        </p>
      </header>

      <CreateDrillForm action={createDrillAction} scenarios={scenarios} />
    </main>
  );
}
