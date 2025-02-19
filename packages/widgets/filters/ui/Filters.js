'use client';
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { IButton } from '@shared/components/ui/buttons';
import Icon from '@shared/components/ui/icon/Icon';
import { showToast } from '@shared/components/toast/ToastManager';
const Filters = () => {
    const handleClick = () => {
        showToast.info('Функционал в разработке');
    };
    return (_jsx(_Fragment, { children: _jsx(IButton, { className: "bg-white flex flex-row items-center gap-4 rounded-xl p-4 text-gray-500 hover:text-gray-900 button-hover-icon", buttonPrefix: _jsx(Icon, { name: "filters", alt: "\u0424\u0438\u043B\u044C\u0442\u0440\u044B", className: "w-6 h-6 text-current transition-colors duration-300" }), onClick: handleClick, children: "\u0424\u0438\u043B\u044C\u0442\u0440\u044B" }) }));
};
export default Filters;
