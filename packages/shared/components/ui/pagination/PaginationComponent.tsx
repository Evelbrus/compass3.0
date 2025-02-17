import React from 'react';
import Pagination from '@shared/components/ui/pagination/Pagination';

interface PaginationComponentProps {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  setPageNumber: (page: number) => void;
}

const PaginationComponent: React.FC<PaginationComponentProps> = ({
  pageNumber,
  pageSize,
  totalCount,
  setPageNumber,
}) => {
  return (
    totalCount > 10 && (
      <Pagination
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalCount={totalCount}
        setPageNumber={setPageNumber}
      />
    )
  );
};

export default PaginationComponent;
