'use client';

import React, { useMemo } from 'react';
import { sortData } from '@shared/components/ui/table/utils/sortData';
import { ITableProps, renderCellValue } from '@shared/components/ui/table';
import { useUnit } from 'effector-react';

import { ArrowIcon } from '@shared/components/ui/icon';
import { $selectedStatus } from '@shared/lib/effector';

interface ITableComponentProps<T> extends ITableProps<T> {
  onSort?: (sortBy: keyof T, sortDirection: 'asc' | 'desc') => void;
  sortBy?: keyof T | null;
  sortDirection?: 'asc' | 'desc';
  enableStatusFilter?: boolean;
}

export const ITable = <T extends Record<string, any>>({
  data,
  columns,
  onSort,
  sortBy = null,
  sortDirection = 'desc',
  enableStatusFilter = false,
}: ITableComponentProps<T>) => {
  const selectedStatus = useUnit($selectedStatus);

  const handleTableSort = (column: keyof T) => {
    if (!onSort || column === 'number') return;

    const newSortDirection = sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';

    onSort(column, newSortDirection);
  };

  const filteredData = useMemo(() => {
    if (!enableStatusFilter || !selectedStatus) return data;
    return data.filter((row) => row.status === selectedStatus);
  }, [data, selectedStatus, enableStatusFilter]);

  const sortedData = useMemo(
    () => sortData(filteredData, sortBy ?? null, sortDirection),
    [filteredData, sortBy, sortDirection],
  );

  // Генерация gridTemplate для управления шириной столбцов
  const gridTemplate = columns
    .map((col) => (col.className?.includes('flex-grow') ? '1fr' : 'auto'))
    .join(' ');

  return (
    <div className="w-full rounded-lg overflow-auto">
      <div className="overflow-x-auto">
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: gridTemplate,
          }}
        >
          <div className="contents bg-gray-100 sticky top-0 z-10">
            {columns.map((col, colIndex) => {
              const isSortable = col.sortable;
              const isFirstCol = colIndex === 0;
              const hoverClass = isSortable ? 'hover:bg-gray-100' : ''; // Условная установка hover-класса

              return (
                <div
                  key={col.accessor as string}
                  onClick={() => isSortable && handleTableSort(col.accessor)}
                  className={`p-6 text-left text-gray-700 cursor-${
                    isSortable ? 'pointer' : 'default'
                  } font-medium text-[14px] leading-[13.83px] flex items-center border-b-2 bg-white ${hoverClass} // Добавлено условное применение hover-класса
                   ${
                     sortBy === col.accessor
                       ? 'border-b-2 border-blue-500 !bg-gray-200'
                       : 'border-b border-transparent'
                   } ${isFirstCol ? 'rounded-bl-lg text-center items-center justify-center' : ''} ${
                     colIndex === columns.length - 1 ? 'rounded-br-lg' : ''
                   } ${col.className || ''}`}
                  aria-sort={
                    sortBy === col.accessor
                      ? sortDirection === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <span>{col.header}</span>
                  {isSortable && sortBy === col.accessor && (
                    <span className="ml-2">
                      <ArrowIcon direction={sortDirection} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="col-span-full h-8 bg-transparent"></div>

          <div className="contents">
            {sortedData.map((row, index) => {
              const isLastRow = index === sortedData.length - 1;

              return (
                <React.Fragment key={index}>
                  {columns.map((col, colIndex) => {
                    const isFirstCol = colIndex === 0;

                    let rowClasses = `p-4 items-center border-b border-gray-300 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-100'
                    } text-gray-800 font-medium text-[14px] leading-[13.83px] flex ${
                      isFirstCol ? 'text-center items-center justify-center' : ''
                    } ${col.className || ''} ${isLastRow ? 'border-none' : ''}`;

                    if (index === 0) {
                      if (colIndex === 0) {
                        rowClasses += ' rounded-tl-lg';
                      }
                      if (colIndex === columns.length - 1) {
                        rowClasses += ' rounded-tr-lg';
                      }
                    }

                    if (isLastRow) {
                      if (colIndex === 0) {
                        rowClasses += ' rounded-bl-lg';
                      }
                      if (colIndex === columns.length - 1) {
                        rowClasses += ' rounded-br-lg';
                      }
                    }

                    return (
                      <div key={col.accessor as string} className={rowClasses}>
                        {col.render ? col.render(row) : renderCellValue(row[col.accessor])}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

ITable.displayName = 'ITable';
