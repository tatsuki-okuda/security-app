import { useState } from 'react';

export function usePagination<T>(items: T[], itemsPerPage: number = 20) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));
  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToPage = (page: number) => setCurrentPage(Math.max(1, Math.min(totalPages, page)));

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToNextPage,
    goToPrevPage,
    goToPage,
    totalItems: items.length,
    itemsPerPage,
  };
}
