import React from 'react';

type SortDirection = 'asc' | 'desc';

export const handleSort = <T>(
  accessor: keyof T,
  sortBy: keyof T | null,
  sortDirection: SortDirection,
  setSortBy: React.Dispatch<React.SetStateAction<keyof T | null>>,
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>,
) => {
  if (sortBy === accessor) {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  } else {
    setSortBy(accessor);
    setSortDirection('asc');
  }
};
