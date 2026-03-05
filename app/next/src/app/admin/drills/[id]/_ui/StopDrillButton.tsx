'use client';

import { useState } from 'react';

import { stopDrillAction } from '../actions';

type Props = {
  drillId: string;
};

export const StopDrillButton = ({ drillId }: Props) => {
  const [isPending, setIsPending] = useState(false);

  const handleStop = async () => {
    if (!confirm('この訓練の配信を停止します。よろしいですか？\n※既に送信済みのメールは取り消せません。')) {
      return;
    }

    setIsPending(true);
    const result = await stopDrillAction(drillId);
    if (result.error) {
      alert(`停止に失敗しました: ${result.error}`);
    }
    setIsPending(false);
  };

  return (
    <button
      onClick={handleStop}
      disabled={isPending}
      className="inline-flex items-center rounded-xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:opacity-70"
    >
      {isPending ? '停止中...' : '配信停止する'}
    </button>
  );
};
