import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { Action } from '@prisma/client';
const DriverNotificationList = ({ notifications, onClose, openModal, }) => {
    const handleNotificationClick = useCallback((notification) => {
        console.log('🟢 Нажатие на уведомление:', notification);
        if (!notification.orderId) {
            console.error('❌ Ошибка: orderId отсутствует в уведомлении');
            return;
        }
        openModal(notification);
        onClose();
    }, [openModal, onClose]);
    //Determine styles and labels based on action type
    const getActionStyles = (action) => {
        switch (action) {
            case Action.inProgress:
                return {
                    bgColor: 'bg-blue-100',
                    textColor: 'text-blue-800',
                    label: 'В процессе',
                };
            case Action.warning:
                return {
                    bgColor: 'bg-red-100',
                    textColor: 'text-red-800',
                    label: 'Предупреждение',
                };
            case Action.noted:
                return {
                    bgColor: 'bg-green-100',
                    textColor: 'text-green-800',
                    label: 'Отмечено',
                };
            default:
                return {
                    bgColor: 'bg-gray-100',
                    textColor: 'text-gray-800',
                    label: 'Неизвестно',
                };
        }
    };
    return (_jsxs("div", { className: "absolute w-[400px] max-h-[400px] right-0 top-10 z-50 bg-[#EFEFEF] p-4 rounded-md shadow-lg overflow-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800", children: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F" }), _jsx(IButton, { variant: "close", onClick: onClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E", className: "absolute top-2 right-2 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2", children: _jsx(CloseIcon, {}) })] }), notifications.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center", children: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0439 \u043D\u0435\u0442" })) : (_jsx("ul", { className: "space-y-2", children: notifications.map((notification) => {
                    const { bgColor, textColor, label } = getActionStyles(notification.action);
                    return (_jsxs("li", { className: `p-4 rounded-md shadow-sm cursor-pointer transition-colors hover:bg-opacity-80 ${bgColor} ${notification.read ? 'opacity-50' : ''}`, onClick: () => handleNotificationClick(notification), children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("h2", { className: `text-lg font-semibold ${textColor}`, children: notification.title }), _jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${textColor} ${bgColor}`, children: label })] }), _jsx("p", { className: "text-sm text-gray-700", children: notification.message }), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsx("span", { className: "text-xs text-gray-500", children: new Date(notification.createdAt).toLocaleString() }), !notification.read && (_jsx("span", { className: "text-xs font-medium text-blue-500", children: "\u041D\u0435\u043F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043E" }))] })] }, notification.uuid));
                }) }))] }));
};
export default DriverNotificationList;
