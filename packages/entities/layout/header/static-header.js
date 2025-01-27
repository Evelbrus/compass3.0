import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { roleTranslations } from 'shared/lib/effector/(users)/options-and-translation/optionsTranslationUser';
export const StaticHeader = ({ role, additionalContent }) => {
    return (_jsxs("header", { className: "p-4 flex justify-between items-center max-h-[300px] relative", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-white flex items-center justify-center", children: _jsx("span", { className: "text-lg", children: "\uD83D\uDC64" }) }), _jsx("span", { className: "text-4 leading-4 font-medium", children: role ? roleTranslations[role] : 'Гость' })] }), _jsx("div", { className: "flex items-center space-x-4", children: additionalContent })] }));
};
