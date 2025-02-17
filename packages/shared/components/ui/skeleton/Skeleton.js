import { jsx as _jsx } from "react/jsx-runtime";
export const Skeleton = ({ width, height, borderRadius = '15px' }) => {
    return (_jsx("div", { className: "relative overflow-hidden flex items-center justify-center", style: {
            width: typeof width === 'string' ? width : `${width}px`,
            height: typeof height === 'string' ? height : `${height}px`,
            borderRadius,
        }, children: _jsx("div", { className: "absolute top-0 left-0 h-full w-[150px] via-gray-100 to-gray-300 animate-pulse", style: {
                animation: 'pulse 2s infinite ease-in-out',
            } }) }));
};
