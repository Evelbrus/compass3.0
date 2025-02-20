import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { OrderStatus, DriverAcceptanceStatus, Action, } from '@prisma/client';
import { fetchOrderDetails, updateOrderStatus, } from '@widgets/orders/modal/driver/api/apiDriverModel';
const OrderProgressModal = ({ isOpen, onClose, notification, }) => {
    const [currentStage, setCurrentStage] = useState(DriverAcceptanceStatus.PENDING);
    const [orderStatus, setOrderStatus] = useState(OrderStatus.PENDING);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const [showAdditionalServices, setShowAdditionalServices] = useState(false);
    const socket = useSocket();
    useEffect(() => {
        if (!isOpen || !notification.orderId)
            return;
        setIsLoading(true);
        fetchOrderDetails(notification.orderId)
            .then((data) => {
            setOrderData(data);
            setOrderStatus(data.status);
            setCurrentStage(data.driverAcceptanceStatus || DriverAcceptanceStatus.PENDING);
            if (data.status === OrderStatus.COMPLETED ||
                data.status === OrderStatus.CANCELLED ||
                data.status === OrderStatus.OVERDUE) {
                onClose();
            }
            setIsLoading(false);
        })
            .catch((err) => {
            console.error('Ошибка загрузки данных:', err);
            setError('Не удалось загрузить данные заказа');
            setIsLoading(false);
        });
        if (socket) {
            const handleNotification = (data) => {
                if (data.uuid === notification.uuid && data.orderId === notification.orderId) {
                    fetchOrderDetails(notification.orderId)
                        .then((updatedData) => {
                        setCurrentStage(updatedData.driverAcceptanceStatus || DriverAcceptanceStatus.PENDING);
                        setOrderStatus(updatedData.status);
                        if (updatedData.status === OrderStatus.COMPLETED ||
                            updatedData.status === OrderStatus.CANCELLED ||
                            updatedData.status === OrderStatus.OVERDUE) {
                            onClose();
                        }
                    })
                        .catch((err) => {
                        console.error('Ошибка при обновлении данных заказа:', err);
                    });
                }
            };
            socket.on('notification', handleNotification);
            return () => {
                socket.off('notification', handleNotification);
            };
        }
    }, [isOpen, notification.orderId, notification.uuid, socket, onClose]);
    const stages = {
        PENDING: 'Ожидание принятия заказа',
        TAKEN: 'Водитель уведомлен о заказе',
        ACCEPTED: 'Заказ принят водителем',
        ON_THE_WAY: 'Еду к клиенту',
        ARRIVED: 'Прибыл к клиенту',
        PICKED_UP: 'Клиент в машине, поездка начата',
        COMPLETED: 'Поездка завершена',
        TIMEOUT: 'Время ожидания истекло',
    };
    const stageToOrderStatus = {
        TAKEN: OrderStatus.PLANNED,
        ACCEPTED: OrderStatus.IN_PROGRESS,
        ON_THE_WAY: OrderStatus.IN_PROGRESS,
        ARRIVED: OrderStatus.IN_PROGRESS,
        PICKED_UP: OrderStatus.IN_PROGRESS,
        COMPLETED: OrderStatus.COMPLETED,
        PENDING: OrderStatus.CANCELLED,
    };
    const handleNextStage = async (nextDriverStage) => {
        setIsLoading(true);
        setError(null);
        try {
            const newOrderStatus = stageToOrderStatus[nextDriverStage] || orderStatus;
            const isFinalStage = nextDriverStage === DriverAcceptanceStatus.COMPLETED ||
                nextDriverStage === DriverAcceptanceStatus.TIMEOUT;
            const updatedAction = isFinalStage
                ? nextDriverStage === DriverAcceptanceStatus.COMPLETED
                    ? Action.success
                    : Action.cancelled
                : undefined;
            await updateOrderStatus({
                orderUuid: notification.orderId,
                driverStatus: nextDriverStage,
                orderStatus: newOrderStatus,
                driverId: notification.userId,
                notificationUuid: notification.uuid,
                markNotificationAsRead: isFinalStage,
                action: updatedAction,
            });
            setCurrentStage(nextDriverStage);
            setOrderStatus(newOrderStatus);
            if (socket) {
                socket.emit('notification', {
                    userId: notification.userId,
                    notification: {
                        uuid: notification.uuid,
                        orderId: notification.orderId,
                        read: isFinalStage,
                        action: updatedAction,
                    },
                });
            }
            if (isFinalStage) {
                onClose();
            }
        }
        catch (err) {
            console.error('Ошибка при обновлении статуса:', err);
            setError(err instanceof Error ? err.message : 'Не удалось обновить статус');
        }
        finally {
            setIsLoading(false);
        }
    };
    const getNextActions = () => {
        switch (currentStage) {
            case DriverAcceptanceStatus.PENDING:
            case DriverAcceptanceStatus.TAKEN:
                return (_jsxs(_Fragment, { children: [_jsx("button", { className: `px-5 py-2 rounded-md text-white transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`, onClick: () => handleNextStage(DriverAcceptanceStatus.ACCEPTED), disabled: isLoading, children: "\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0437\u0430\u043A\u0430\u0437" }), _jsx("button", { className: `px-5 py-2 rounded-md text-white transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`, onClick: () => handleNextStage(DriverAcceptanceStatus.TIMEOUT), disabled: isLoading, children: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437" })] }));
            case DriverAcceptanceStatus.ACCEPTED:
                return (_jsx("button", { className: `px-5 py-2 rounded-md text-white transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`, onClick: () => handleNextStage(DriverAcceptanceStatus.ON_THE_WAY), disabled: isLoading, children: "\u0415\u0434\u0443 \u043A \u043A\u043B\u0438\u0435\u043D\u0442\u0443" }));
            case DriverAcceptanceStatus.ON_THE_WAY:
                return (_jsx("button", { className: `px-5 py-2 rounded-md text-white transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`, onClick: () => handleNextStage(DriverAcceptanceStatus.ARRIVED), disabled: isLoading, children: "\u041F\u0440\u0438\u0431\u044B\u043B \u043A \u043A\u043B\u0438\u0435\u043D\u0442\u0443" }));
            case DriverAcceptanceStatus.ARRIVED:
                return (_jsx("button", { className: `px-5 py-2 rounded-md text-white transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`, onClick: () => handleNextStage(DriverAcceptanceStatus.PICKED_UP), disabled: isLoading, children: "\u041D\u0430\u0447\u0430\u0442\u044C \u043F\u043E\u0435\u0437\u0434\u043A\u0443" }));
            case DriverAcceptanceStatus.PICKED_UP:
                return (_jsx("button", { className: `px-5 py-2 rounded-md text-white transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`, onClick: () => handleNextStage(DriverAcceptanceStatus.COMPLETED), disabled: isLoading, children: "\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u043F\u043E\u0435\u0437\u0434\u043A\u0443" }));
            default:
                return null;
        }
    };
    if (!isOpen)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50", onClick: onClose }), _jsxs("div", { className: "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-5 rounded-lg shadow-lg z-50 w-[500px] max-w-[90%]", children: [_jsxs("h2", { className: "text-xl font-semibold mb-4", children: ["\u0417\u0430\u043A\u0430\u0437 #", notification.orderId] }), isLoading && !orderData ? (_jsx("div", { className: "flex justify-center", children: _jsx("div", { className: "w-5 h-5 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" }) })) : orderData ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("p", { children: [_jsx("strong", { children: "\u0412\u0440\u0435\u043C\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F:" }), ' ', new Date(orderData.departureTime).toLocaleString()] }), _jsxs("p", { children: [_jsx("strong", { children: "\u041E\u0442\u043A\u0443\u0434\u0430:" }), " ", orderData.departurePoint.address] }), _jsxs("p", { children: [_jsx("strong", { children: "\u041A\u0443\u0434\u0430:" }), " ", orderData.arrivalPoint.address] }), _jsxs("p", { children: [_jsx("strong", { children: "\u041A\u043B\u0438\u0435\u043D\u0442:" }), " ", orderData.createdBy.fullName, " (", orderData.createdBy.phone, ")"] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0422\u0430\u0440\u0438\u0444:" }), " ", orderData.tariff.name, " (", orderData.tariff.price, " \u0441\u043E\u043C)"] }), orderData.description && (_jsxs("p", { children: [_jsx("strong", { children: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435:" }), " ", orderData.description] }))] }), orderData.additionalServices && orderData.additionalServices.length > 0 && (_jsxs("div", { children: [_jsx("button", { className: "text-blue-500 hover:underline", onClick: () => setShowAdditionalServices(!showAdditionalServices), children: showAdditionalServices ? 'Скрыть доп. услуги' : 'Показать доп. услуги' }), showAdditionalServices && (_jsx("ul", { className: "mt-2 list-disc pl-5", children: orderData.additionalServices.map((service) => (_jsxs("li", { children: [service.name, " - ", service.price, " \u0441\u043E\u043C"] }, service.uuid))) }))] })), _jsxs("p", { className: "mt-4 font-semibold", children: ["\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u044D\u0442\u0430\u043F: ", stages[currentStage]] }), error && _jsx("p", { className: "text-red-500", children: error }), isLoading && (_jsx("div", { className: "inline-block w-5 h-5 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" }))] })) : (_jsx("p", { children: "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u0437\u0430\u043A\u0430\u0437\u0430" })), _jsxs("div", { className: "mt-5 flex gap-2", children: [getNextActions(), currentStage !== DriverAcceptanceStatus.COMPLETED &&
                                currentStage !== DriverAcceptanceStatus.TIMEOUT && (_jsx("button", { className: `px-5 py-2 rounded-md text-white transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`, onClick: () => handleNextStage(DriverAcceptanceStatus.TIMEOUT), disabled: isLoading, children: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437" }))] })] })] }));
};
export default OrderProgressModal;
