import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
const SkeletonTable = ({ columns, rows = 5 }) => {
    return (_jsx("div", { className: "w-full rounded-lg overflow-auto animate-pulse", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("div", { className: "grid w-full", style: {
                    gridTemplateColumns: columns.map(() => 'auto').join(' '),
                }, children: [_jsx("div", { className: "contents bg-gray-100 sticky top-0 z-10", children: columns.map((col) => (_jsx("div", { className: `p-6 text-left text-gray-700 font-medium text-[14px] leading-[13.83px] flex items-center border-b-2 bg-gray-200`, children: _jsx("div", { className: "h-4 bg-gray-300 rounded w-3/4" }) }, String(col.accessor)))) }), _jsx("div", { className: "col-span-full h-8 bg-transparent" }), Array.from({ length: rows }, (_, rowIndex) => (_jsx(React.Fragment, { children: columns.map((col, colIndex) => (_jsx("div", { className: `p-7 border-b border-gray-300 text-gray-800 font-medium text-[14px] leading-[13.83px] flex items-center ${colIndex === 0 ? 'text-center justify-center' : ''}`, children: _jsx("div", { className: "h-4 bg-gray-300 rounded w-full" }) }, String(col.accessor)))) }, rowIndex)))] }) }) }));
};
export default SkeletonTable;
