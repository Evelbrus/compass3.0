import { jsx as _jsx } from "react/jsx-runtime";
export const StaticHeader = ({ additionalContent }) => {
    return (_jsx("header", { className: "p-4 flex justify-between items-center h-[100px] max-h-[100px] relative", children: _jsx("div", { className: "w-full flex items-center space-x-4", children: additionalContent }) }));
};
