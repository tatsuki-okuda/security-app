import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export type SortConfig<T> = {
  key: keyof T | string;
  direction: SortDirection;
} | null;

export function useTableSort<T>(items: T[], customSort?: (a: T, b: T, config: NonNullable<SortConfig<T>>) => number) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null);

  const requestSort = (key: keyof T | string) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (sortConfig !== null) {
      if (customSort) {
        sortableItems.sort((a, b) => customSort(a, b, sortConfig));
      } else {
        sortableItems.sort((a, b) => {
          const aKey = a[sortConfig.key as keyof T];
          const bKey = b[sortConfig.key as keyof T];
          
          let aValue: string | number | boolean | Date = '';
          let bValue: string | number | boolean | Date = '';

          if (aKey !== null && aKey !== undefined) {
            aValue = aKey as string | number | boolean | Date;
          }
          if (bKey !== null && bKey !== undefined) {
            bValue = bKey as string | number | boolean | Date;
          }

          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    return sortableItems;
  }, [items, sortConfig, customSort]);

  return { sortConfig, requestSort, sortedItems };
}
