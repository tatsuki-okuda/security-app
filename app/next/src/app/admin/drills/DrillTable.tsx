'use client';

import { useMemo, useState } from 'react';
import { ArrowUpDown, FileX } from 'lucide-react';
import Link from 'next/link';
import { scenarios } from '../../../features/drill/domain/scenarios';

type DrillSummary = {
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

type SortKey = keyof DrillSummary | 'scenarioLabel';

const SortHeader = ({ 
  label, 
  sortKey, 
  sortConfig, 
  onRequestSort 
}: { 
  label: string; 
  sortKey: SortKey; 
  sortConfig: { key: SortKey; direction: 'asc' | 'desc' } | null;
  onRequestSort: (key: SortKey) => void;
}) => (
  <th 
    className="px-4 py-3 cursor-pointer hover:bg-surface/50 transition-colors group"
    onClick={() => onRequestSort(sortKey)}
  >
    <div className="flex items-center gap-1">
      {label}
      <ArrowUpDown className={`h-3 w-3 transition-opacity ${sortConfig?.key === sortKey ? 'opacity-100 text-primary' : 'opacity-40 group-hover:opacity-100'}`} />
    </div>
  </th>
);

export function DrillTable({ drills }: Props) {
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const sortedDrills = useMemo(() => {
    const sortableItems = [...drills];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: string | number | Date | null | undefined = a[sortConfig.key as keyof DrillSummary];
        let bValue: string | number | Date | null | undefined = b[sortConfig.key as keyof DrillSummary];

        if (sortConfig.key === 'scenarioLabel') {
          aValue = scenarios.find((s) => s.value === a.scenarioId)?.label ?? a.scenarioId;
          bValue = scenarios.find((s) => s.value === b.scenarioId)?.label ?? b.scenarioId;
        }

        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [drills, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedDrills.length / itemsPerPage));
  const paginatedDrills = sortedDrills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg text-xs font-semibold uppercase tracking-wide text-text-secondary select-none">
              <tr>
                <SortHeader label="訓練名" sortKey="title" sortConfig={sortConfig} onRequestSort={requestSort} />
                <SortHeader label="対象者数" sortKey="recipientCount" sortConfig={sortConfig} onRequestSort={requestSort} />
                <SortHeader label="クリック" sortKey="clickCount" sortConfig={sortConfig} onRequestSort={requestSort} />
                <SortHeader label="合格数" sortKey="passCount" sortConfig={sortConfig} onRequestSort={requestSort} />
                <SortHeader label="シナリオ" sortKey="scenarioLabel" sortConfig={sortConfig} onRequestSort={requestSort} />
                <SortHeader label="状態" sortKey="status" sortConfig={sortConfig} onRequestSort={requestSort} />
                <SortHeader label="送信日時" sortKey="sentAt" sortConfig={sortConfig} onRequestSort={requestSort} />
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

      {sortedDrills.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-secondary px-2">
          <div className="flex items-center gap-2">
            <span>{itemsPerPage}件ずつ表示</span>
            <div className="bg-surface border border-border rounded px-2 py-1 font-medium">{itemsPerPage}</div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              前へ
            </button>
            <div className="flex items-center gap-1 px-2">
               {Array.from({ length: totalPages }).map((_, i) => (
                 <button
                   key={i}
                   onClick={() => setCurrentPage(i + 1)}
                   className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${currentPage === i + 1 ? 'bg-primary text-white font-medium' : 'hover:bg-surface/80'}`}
                 >
                   {i + 1}
                 </button>
               ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              次へ
            </button>
          </div>

          <div className="text-right">
             {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedDrills.length)}件 / 全{sortedDrills.length}件
          </div>
        </div>
      )}
    </div>
  );
}
