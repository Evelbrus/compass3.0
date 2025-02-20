'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { updateOrderStatus } from '@widgets/orders/modal/driver/api/apiDriverModel';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { DriverAcceptanceStatus, OrderStatus, Action } from '@prisma/client';
const WarningAdminModal = ({ isOpen, onClose, notification }) => {
    const [isLoading, setIsLoading] = useState(false);
    const socket = useSocket();
    const handleUpdateOrder = async () => {
        setIsLoading(true);
        try {
            await updateOrderStatus({
                orderUuid: notification.orderId,
                driverStatus: DriverAcceptanceStatus.PENDING,
                orderStatus: OrderStatus.PLANNED,
                driverId: undefined,
                notificationUuid: notification.uuid,
                markNotificationAsRead: true,
                action: Action.noted,
            });
            if (socket) {
                socket.emit('notification', {
                    userId: notification.userId,
                    notification: {
                        uuid: notification.uuid,
                        orderId: notification.orderId,
                        read: true,
                        action: Action.noted,
                    },
                });
            }
            onClose();
        }
        catch (err) {
            console.error('Ошибка при обновлении заказа:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleClose = async () => {
        try {
            await updateOrderStatus({
                orderUuid: notification.orderId,
                notificationUuid: notification.uuid,
                markNotificationAsRead: true,
            });
            if (socket) {
                socket.emit('notification', {
                    userId: notification.userId,
                    notification: {
                        uuid: notification.uuid,
                        orderId: notification.orderId,
                        read: true,
                    },
                });
            }
            onClose();
        }
        catch (err) {
            console.error('Ошибка при закрытии уведомления:', err);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-[90%]", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u044C \u043D\u0435 \u043F\u0440\u0438\u043D\u044F\u043B \u0437\u0430\u043A\u0430\u0437" }), _jsxs("p", { className: "mb-4", children: ["\u0417\u0430\u043A\u0430\u0437 #", notification.orderId, " \u043D\u0435 \u0431\u044B\u043B \u043F\u0440\u0438\u043D\u044F\u0442 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u043C \u0432\u043E\u0432\u0440\u0435\u043C\u044F. \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0437\u0430\u043A\u0430\u0437 \u0438\u043B\u0438 \u0437\u0430\u043A\u0440\u043E\u0439\u0442\u0435 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u0435."] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { className: `px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`, onClick: handleUpdateOrder, disabled: isLoading, children: isLoading ? 'Обновление...' : 'Обновить заказ' }), _jsx("button", { className: "px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition", onClick: handleClose, children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })] })] }) }));
};
export default WarningAdminModal;
