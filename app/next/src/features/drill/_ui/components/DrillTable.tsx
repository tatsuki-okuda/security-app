'use client';

import { FileX } from 'lucide-react';
import Link from 'next/link';

import { usePagination } from '../../../../shared/hooks/usePagination';
import { useTableSort } from '../../../../shared/hooks/useTableSort';
import { Pagination } from '../../../../shared/ui/table/Pagination';
import { SortHeader } from '../../../../shared/ui/table/SortHeader';
import { scenarios } from '../../domain/scenarios';

export type DrillSummary = {
  id: string;
  title: string;
  scenarioId: string | null;
  status: string;
  channel: string;
  sentAt: Date | null;
  recipientCount: number;
  clickCount: number;
  passCount: number;
};

type Props = {
  drills: DrillSummary[];
};

export function DrillTable({ drills }: Props) {
  const customSort = (a: DrillSummary, b: DrillSummary, config: { key: string; direction: 'asc' | 'desc' }) => {
    let aValue: string | number | Date | null | undefined = a[config.key as keyof DrillSummary];
    let bValue: string | number | Date | null | undefined = b[config.key as keyof DrillSummary];

    if (config.key === 'scenarioLabel') {
      aValue = scenarios.find((s) => s.value === a.scenarioId)?.label ?? a.scenarioId;
      bValue = scenarios.find((s) => s.value === b.scenarioId)?.label ?? b.scenarioId;
    }

    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';

    if (aValue < bValue) return config.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return config.direction === 'asc' ? 1 : -1;
    return 0;
  };

  const { sortConfig, requestSort, sortedItems } = useTableSort<DrillSummary>(drills, customSort);
  
  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedDrills,
    goToNextPage,
    goToPrevPage,
    goToPage,
    totalItems,
    itemsPerPage
  } = usePagination(sortedItems, 20);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg text-xs font-semibold uppercase tracking-wide text-text-secondary select-none">
              <tr>
                <SortHeader<DrillSummary> label="訓練名" sortKey="title" sortConfig={sortConfig} onRequestSort={requestSort} />
                <SortHeader<DrillSummary> label="対象者数" sortKey="recipientCount" sortConfig={sortConfig} onRequestSort={requestSort} />
                <SortHeader<DrillSummary> label="クリック" sortKey="clickCount" sortConfig={sortConfig} onRequestSort={requestSort} />
                <SortHeader<DrillSummary> label="合格数" sortKey="passCount" sortConfig={sortConfig} onRequestSort={requestSort} />
                <SortHeader<DrillSummary> label="シナリオ" sortKey="scenarioLabel" sortConfig={sortConfig} onRequestSort={requestSort} />
                <SortHeader<DrillSummary> label="状態" sortKey="status" sortConfig={sortConfig} onRequestSort={requestSort} />
                <SortHeader<DrillSummary> label="送信日時" sortKey="sentAt" sortConfig={sortConfig} onRequestSort={requestSort} />
              </tr>
            </thead>
            <tbody>
              {paginatedDrills.length > 0 ? (
                paginatedDrills.map((drill) => (
                  <tr key={drill.id} className="border-t border-border hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/drills/${drill.id}`} className="font-semibold text-text-primary hover:underline outline-none focus:ring-2 focus:ring-primary rounded">
                        {drill.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{drill.recipientCount}</td>
                    <td className="px-4 py-3 text-text-secondary">{drill.clickCount} / {drill.recipientCount}</td>
                    <td className="px-4 py-3 text-text-secondary">{drill.passCount} / {drill.recipientCount}</td>
                    <td className="px-4 py-3 text-text-secondary">
                      {scenarios.find((s) => s.value === drill.scenarioId)?.label ?? drill.scenarioId}
                      {' ・ '}
                      {drill.channel === 'email' ? 'メール' : drill.channel === 'slack' ? 'Slack' : drill.channel === 'both' ? '両方' : drill.channel}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">
                      {drill.status === 'draft' && <span className="text-text-secondary">ドラフト</span>}
                      {drill.status === 'deliverable' && <span className="text-primary opacity-80">配信可能</span>}
                      {drill.status === 'delivering' && <span className="text-primary">配信中</span>}
                      {drill.status === 'sent' && <span className="text-success">送信済</span>}
                      {drill.status === 'failed' && <span className="text-error">失敗</span>}
                      {drill.status === 'stopped' && <span className="text-warning">配信停止</span>}
                      {!['draft', 'deliverable', 'delivering', 'sent', 'failed', 'stopped'].includes(drill.status) && <span className="text-text-secondary">{drill.status}</span>}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">
                      {drill.sentAt ? new Date(drill.sentAt).toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '未送信'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-text-secondary border-t border-border">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <FileX className="h-8 w-8 opacity-50" />
                       <p>訓練データがありません</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        goToPage={goToPage}
        goToPrevPage={goToPrevPage}
        goToNextPage={goToNextPage}
      />
    </div>
  );
}
