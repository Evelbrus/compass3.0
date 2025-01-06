import React from 'react';
import { ITableProps } from '@shared/components/ui/table';

interface SkeletonTableProps<T> {
  columns: ITableProps<T>['columns'];
  rows?: number;
}

const SkeletonTable = <T,>({ columns, rows = 5 }: SkeletonTableProps<T>) => {
  return (
    <div className="w-full rounded-lg overflow-auto animate-pulse">
      <div className="overflow-x-auto">
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: columns.map(() => 'auto').join(' '),
          }}
        >
          <div className="contents bg-gray-100 sticky top-0 z-10">
            {columns.map((col) => (
              <div
                key={String(col.accessor)}
                className={`p-6 text-left text-gray-700 font-medium text-[14px] leading-[13.83px] flex items-center border-b-2 bg-gray-200`}
              >
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>

          {/* Пустая строка для разделения */}
          <div className="col-span-full h-8 bg-transparent"></div>

          {/* Скелетоны строк */}
          {Array.from({ length: rows }, (_, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {columns.map((col, colIndex) => (
                <div
                  key={String(col.accessor)}
                  className={`p-4 border-b border-gray-300 text-gray-800 font-medium text-[14px] leading-[13.83px] flex items-center ${
                    colIndex === 0 ? 'text-center justify-center' : ''
                  }`}
                >
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonTable;
