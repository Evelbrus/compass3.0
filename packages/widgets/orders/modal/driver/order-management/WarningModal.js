'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { DriverAcceptanceStatus, OrderStatus, Action } from '@prisma/client';
import { updateOrderStatus } from '@widgets/orders/modal/driver/api/apiDriverModel';
import { useSocket } from '@shared/utils/hooks/useSocket';
const WarningModal = ({ isOpen, onClose, notification }) => {
    const socket = useSocket();
    const handleAcceptOrder = async () => {
        try {
            await updateOrderStatus({
                orderUuid: notification.orderId,
                driverStatus: DriverAcceptanceStatus.TAKEN,
                orderStatus: OrderStatus.IN_PROGRESS,
                driverId: notification.userId,
                notificationUuid: notification.uuid,
                markNotificationAsRead: true,
                action: Action.inProgress,
            });
            if (socket) {
                socket.emit('notification', {
                    userId: notification.userId,
                    notification: {
                        uuid: notification.uuid,
                        orderId: notification.orderId,
                        read: true,
                        action: Action.inProgress,
                    },
                });
            }
            onClose();
        }
        catch (err) {
            console.error('Ошибка при принятии заказа:', err);
        }
    };
    const handleRejectOrder = async () => {
        try {
            await updateOrderStatus({
                orderUuid: notification.orderId,
                driverStatus: DriverAcceptanceStatus.TIMEOUT,
                orderStatus: OrderStatus.CANCELLED,
                driverId: notification.userId,
                notificationUuid: notification.uuid,
                markNotificationAsRead: true,
                action: Action.cancelled,
            });
            if (socket) {
                socket.emit('notification', {
                    userId: notification.userId,
                    notification: {
                        uuid: notification.uuid,
                        orderId: notification.orderId,
                        read: true,
                        action: Action.cancelled,
                    },
                });
            }
            onClose();
        }
        catch (err) {
            console.error('Ошибка при отклонении заказа:', err);
        }
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center", children: _jsxs("div", { className: "bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-[90%]", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0439 \u0437\u0430\u043A\u0430\u0437" }), _jsxs("p", { className: "mb-4", children: ["\u0417\u0430\u043A\u0430\u0437 #", notification.orderId, " \u043F\u043E\u0441\u0442\u0443\u043F\u0438\u043B \u0441 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u043E\u0439. \u0412\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u0432\u0437\u044F\u0442\u044C \u0435\u0433\u043E \u0438\u043B\u0438 \u043E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C."] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition", onClick: handleAcceptOrder, children: "\u0412\u0437\u044F\u0442\u044C \u0437\u0430\u043A\u0430\u0437" }), _jsx("button", { className: "px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition", onClick: handleRejectOrder, children: "\u041E\u0442\u043A\u043B\u043E\u043D\u0438\u0442\u044C" })] })] }) }));
};
export default WarningModal;
