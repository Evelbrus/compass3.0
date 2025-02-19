import { jsx as _jsx } from "react/jsx-runtime";
import { WelcomeIcon } from '@shared/components/ui/icon';
const Loading = () => {
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-white", children: _jsx(WelcomeIcon, {}) }));
};
export default Loading;
