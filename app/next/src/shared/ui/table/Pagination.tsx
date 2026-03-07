
type Props = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  goToPage: (page: number) => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
};

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  goToPage,
  goToPrevPage,
  goToNextPage,
}: Props) {
  if (totalItems === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-text-secondary px-2">
      <div className="flex items-center gap-2">
        <span>{itemsPerPage}件ずつ表示</span>
        <div className="bg-surface border border-border rounded px-2 py-1 font-medium">{itemsPerPage}</div>
      </div>
      
      <div className="flex items-center gap-1">
        <button 
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="p-1 rounded hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          前へ
        </button>
        <div className="flex items-center gap-1 px-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${
                currentPage === i + 1 ? 'bg-primary text-white font-medium' : 'hover:bg-surface/80'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button 
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="p-1 rounded hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          次へ
        </button>
      </div>

      <div className="text-right">
         {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}件 / 全{totalItems}件
      </div>
    </div>
  );
}
