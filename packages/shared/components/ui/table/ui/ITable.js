'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo } from 'react';
import { sortData } from '@shared/components/ui/table/utils/sortData';
import { renderCellValue } from '@shared/components/ui/table';
import { ArrowIcon } from '@shared/components/ui/icon';
export const ITable = ({ data, columns, onSort, sortBy = null, sortDirection = 'desc', disabled = false, }) => {
    const handleTableSort = (column) => {
        if (disabled || !onSort)
            return;
        //Если сортировка по данному столбцу не установлена — устанавливаем по убыванию (desc)
        if (sortBy !== column) {
            onSort(column, 'desc');
        }
        //Если уже сортируем по данному столбцу в порядке убывания — переключаем на возрастание (asc)
        else if (sortBy === column && sortDirection === 'desc') {
            onSort(column, 'asc');
        }
        //Если уже сортируем по данному столбцу в порядке возрастания — сбрасываем сортировку
        else if (sortBy === column && sortDirection === 'asc') {
            onSort(null, 'asc'); //значение sortDirection здесь не важно, когда sortBy === null
        }
    };
    const sortedData = useMemo(() => sortData(data, sortBy, sortDirection), [data, sortBy, sortDirection]);
    const gridTemplate = columns
        .map((col) => (col.className?.includes('flex-grow') ? '1fr' : 'auto'))
        .join(' ');
    //Определяем заголовок сортируемого столбца, если он установлен
    const sortedColumnHeader = sortBy ? columns.find((col) => col.accessor === sortBy)?.header : null;
    return (_jsx("div", { className: "w-full rounded-lg overflow-auto", children: _jsx("div", { className: "overflow-x-auto pb-4", children: _jsxs("div", { className: "grid w-full", style: { gridTemplateColumns: gridTemplate }, children: [_jsx("div", { className: "contents bg-gray-100 sticky top-0 z-10", children: columns.map((col, colIndex) => {
                            const isSortable = col.sortable;
                            const isFirstCol = colIndex === 0;
                            const isSorted = sortBy === col.accessor;
                            return (_jsxs("div", { onClick: () => isSortable && handleTableSort(col.accessor), className: `p-6 text-gray-700 ${isSortable ? 'cursor-pointer' : 'cursor-default'} font-medium text-[14px] leading-[13.83px] flex items-center justify-between bg-white border-b-2 ${isSorted ? 'border-blue-500 !bg-gray-200' : 'border-transparent'} ${isFirstCol ? 'rounded-bl-lg' : ''} ${colIndex === columns.length - 1 ? 'rounded-br-lg' : ''} ${col.className || ''}`, "aria-sort": isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none', children: [_jsx("span", { children: col.header }), isSortable && isSorted && _jsx(ArrowIcon, { direction: sortDirection })] }, String(col.accessor)));
                        }) }), _jsx("div", { className: "col-span-full h-8 bg-transparent flex items-center justify-center", children: sortBy && sortedColumnHeader && (_jsxs("span", { className: "text-sm text-gray-600", children: ["\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043E \"", sortedColumnHeader, "\" \u2014", ' ', sortDirection === 'desc' ? 'по убыванию' : 'по возрастанию'] })) }), _jsx("div", { className: "contents", children: sortedData.map((row, index) => (_jsx(React.Fragment, { children: columns.map((col, colIndex) => {
                                const isFirstCol = colIndex === 0;
                                const isLastRow = index === sortedData.length - 1;
                                let rowClasses = `p-4 items-center border-b border-gray-300 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} text-gray-800 font-medium text-[14px] leading-[13.83px] flex ${isFirstCol ? 'text-center justify-center' : ''} ${col.className || ''} ${isLastRow ? 'border-none' : ''}`;
                                if (index === 0) {
                                    if (colIndex === 0)
                                        rowClasses += ' rounded-tl-lg';
                                    if (colIndex === columns.length - 1)
                                        rowClasses += ' rounded-tr-lg';
                                }
                                if (isLastRow) {
                                    if (colIndex === 0)
                                        rowClasses += ' rounded-bl-lg';
                                    if (colIndex === columns.length - 1)
                                        rowClasses += ' rounded-br-lg';
                                }
                                return (_jsx("div", { className: rowClasses, children: col.render ? col.render(row) : renderCellValue(row[col.accessor]) }, String(col.accessor)));
                            }) }, index))) })] }) }) }));
};
ITable.displayName = 'ITable';
