import { jsx as _jsx } from "react/jsx-runtime";
const Spinner = ({ size = 'medium' }) => {
    const sizeClass = size === 'small' ? 'w-4 h-4' : size === 'large' ? 'w-8 h-8' : 'w-6 h-6';
    return (_jsx("div", { className: `animate-spin rounded-full border-t-2 border-b-2 border-blue-500 ${sizeClass}` }));
};
export default Spinner;
