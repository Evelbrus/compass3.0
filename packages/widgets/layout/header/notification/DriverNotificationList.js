import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
const DriverNotificationList = ({ notifications, onClose, openModal, }) => {
    const handleNotificationClick = useCallback((notification) => {
        console.log('🟢 Нажатие на уведомление:', notification);
        if (!notification.orderId) {
            console.error('❌ Ошибка: orderId отсутствует в уведомлении');
            return;
        }
        openModal(notification.action);
        onClose();
    }, [openModal, onClose]);
    return (_jsxs("div", { className: "absolute w-[400px] h-[400px] right-0 top-10 z-50 bg-[#EFEFEF] p-4 rounded-md shadow-lg overflow-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800", children: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" }), _jsx(IButton, { variant: "close", onClick: onClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C", children: _jsx(CloseIcon, {}) })] }), _jsx("ul", { children: notifications.map((notification) => (_jsx("li", { className: "cursor-pointer p-2", onClick: () => handleNotificationClick(notification), children: _jsx("p", { children: notification.title }) }, notification.uuid))) })] }));
};
export default DriverNotificationList;
