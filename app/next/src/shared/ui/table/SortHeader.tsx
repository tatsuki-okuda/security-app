import { ArrowUpDown } from 'lucide-react';
import { ReactNode } from 'react';

import { SortConfig } from '../../hooks/useTableSort';

type Props<T> = {
  label: ReactNode;
  sortKey: keyof T | string;
  sortConfig: SortConfig<T>;
  onRequestSort: (key: keyof T | string) => void;
  className?: string;
};

export function SortHeader<T>({ label, sortKey, sortConfig, onRequestSort, className = '' }: Props<T>) {
  const isSorted = sortConfig?.key === sortKey;
  return (
    <th 
      className={`px-4 py-3 cursor-pointer hover:bg-surface/50 transition-colors group ${className}`}
      onClick={() => onRequestSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown 
          className={`h-3 w-3 transition-opacity ${
            isSorted ? 'opacity-100 text-primary' : 'opacity-40 group-hover:opacity-100'
          }`} 
        />
      </div>
    </th>
  );
}
