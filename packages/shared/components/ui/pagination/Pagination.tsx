import React, { JSX } from 'react';
import { IButton } from '@shared/components/ui/buttons';

interface PaginationProps {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  setPageNumber: (page: number) => void;
  disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  pageNumber,
  pageSize,
  totalCount,
  setPageNumber,
  disabled = false,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleFirstPage = () => {
    if (!disabled && pageNumber !== 1) setPageNumber(1);
  };

  const handlePreviousPage = () => {
    if (!disabled && pageNumber > 1) setPageNumber(pageNumber - 1);
  };

  const handleNextPage = () => {
    if (!disabled && pageNumber < totalPages) setPageNumber(pageNumber + 1);
  };

  const handleLastPage = () => {
    if (!disabled && pageNumber !== totalPages) setPageNumber(totalPages);
  };

  const handlePageClick = (page: number) => {
    if (!disabled && page !== pageNumber) setPageNumber(page);
  };

  const renderPageButtons = () => {
    const pageButtons: JSX.Element[] = [];
    const maxVisiblePages = 3;
    const startPage = Math.max(1, pageNumber - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <IButton
          key={i}
          onClick={() => handlePageClick(i)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg border ${
            pageNumber === i
              ? 'bg-gray-700 text-white'
              : 'bg-white text-gray-500 border-gray-300 hover:bg-blue-100'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={disabled}
        >
          {i}
        </IButton>,
      );
    }

    return pageButtons;
  };

  if (totalPages === 0) return null;

  return (
    <div className="flex justify-end gap-2 px-5 pb-4">
      <IButton
        onClick={handleFirstPage}
        className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-blue-100 ${
          pageNumber === 1 || disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={pageNumber === 1 || disabled}
      >
        &lt;&lt;
      </IButton>

      <IButton
        onClick={handlePreviousPage}
        className={`w-8 h-8 rounded-lg flex items-center justify-center border border-gray-300 bg-white text-gray-500 hover:bg-blue-100 ${
          pageNumber === 1 || disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={pageNumber === 1 || disabled}
      >
        &lt;
      </IButton>

      {renderPageButtons()}

      <IButton
        onClick={handleNextPage}
        className={`w-8 h-8 rounded-lg flex items-center justify-center border border-gray-300 bg-white text-gray-500 hover:bg-blue-100 ${
          pageNumber === totalPages || disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={pageNumber === totalPages || disabled}
      >
        &gt;
      </IButton>

      <IButton
        onClick={handleLastPage}
        className={`w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-blue-100 ${
          pageNumber === totalPages || disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={pageNumber === totalPages || disabled}
      >
        &gt;&gt;
      </IButton>
    </div>
  );
};

export default Pagination;
