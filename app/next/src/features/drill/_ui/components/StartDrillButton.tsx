'use client';

import { Send } from 'lucide-react';
import { useState } from 'react';

import { startDrillAction } from '../../../../app/admin/drills/[id]/actions';

type Props = {
  drillId: string;
};

export const StartDrillButton = ({ drillId }: Props) => {
  const [isPending, setIsPending] = useState(false);

  const handleStart = async () => {
    if (!confirm('この訓練の配信を開始します。よろしいですか？\n※送信後は取り消せません。')) {
      return;
    }

    setIsPending(true);
    const result = await startDrillAction(drillId);
    if (result.error) {
      alert(`配信開始に失敗しました: ${result.error}`);
    }
    setIsPending(false);
  };

  return (
    <button
      onClick={handleStart}
      disabled={isPending}
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-500 disabled:opacity-70"
    >
      <Send className="h-4 w-4" />
      {isPending ? '配信準備中...' : '配信を開始する'}
    </button>
  );
};
