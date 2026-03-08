

import { createContainer } from '../../../_di/container.server';
import { DrillListView } from '../../../features/drill/_ui/components/DrillListView';

export default async function Page() {
  const c = createContainer();
  const result = await c.admin.usecases.listDrills();

  if (!result.ok) {
    return <DrillListView error="一覧の取得に失敗しました。" />;
  }

  return <DrillListView drills={result.value} />;
}
