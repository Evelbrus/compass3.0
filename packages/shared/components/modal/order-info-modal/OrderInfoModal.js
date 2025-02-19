'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { DriverAcceptanceStatus } from '@prisma/client';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from '@shared/components/ui/icon';
import { TextInput } from '@shared/components/ui/inputs';
const OrderInfoModal = ({ isOpen, onClose, currentNotification, notifications, }) => {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    //При монтировании устанавливаем текущий индекс уведомления
    useEffect(() => {
        const index = notifications.findIndex((n) => n.uuid === currentNotification.uuid);
        if (index !== -1) {
            setCurrentIndex(index);
        }
    }, [currentNotification, notifications]);
    //При монтировании модалки отправляем PATCH-запрос для обновления статуса заказа
    useEffect(() => {
        if (!currentNotification || !currentNotification.orderId)
            return;
        fetch(`/api/orders/drivers/${currentNotification.orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                driverProgressStatus: DriverAcceptanceStatus.TAKEN,
            }),
        })
            .then((res) => {
            if (!res.ok) {
                throw new Error(`Ошибка обновления заказа: ${res.statusText}`);
            }
            return res.json();
        })
            .then((data) => {
            console.log('Заказ обновлён (PATCH):', data);
        })
            .catch((err) => {
            console.error('Ошибка при отправке PATCH-запроса:', err);
        });
    }, [currentNotification]);
    //Загружаем данные заказа по orderId из текущего уведомления
    useEffect(() => {
        if (!currentNotification || !currentNotification.orderId)
            return;
        setLoading(true);
        fetch(`/api/orders/${currentNotification.orderId}`)
            .then((res) => {
            if (!res.ok) {
                throw new Error(`Ошибка получения заказа: ${res.statusText}`);
            }
            return res.json();
        })
            .then((data) => {
            setOrderData(data);
            setLoading(false);
        })
            .catch((err) => {
            console.error('Ошибка при загрузке данных заказа:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных заказа');
            setLoading(false);
        });
    }, [currentNotification]);
    //Функция для пометки текущего уведомления как прочитанного
    const markNotificationAsRead = async () => {
        try {
            const response = await fetch(`/api/notifications/${currentNotification.uuid}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ read: true }),
            });
            if (!response.ok) {
                throw new Error(`Ошибка обновления уведомления: ${response.statusText}`);
            }
            console.log('Уведомление отмечено как прочитанное');
        }
        catch (err) {
            console.error('Ошибка при обновлении уведомления:', err);
        }
    };
    //Переход к предыдущему уведомлению
    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
            //При необходимости можно обновлять currentNotification через callback в родительском компоненте
        }
    };
    //Переход к следующему уведомлению
    const handleNext = () => {
        if (currentIndex < notifications.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            //Аналогично, можно обновлять currentNotification через callback
        }
    };
    //При закрытии модалки помечаем текущее уведомление как прочитанное и закрываем модалку
    const handleClose = async () => {
        await markNotificationAsRead();
        onClose();
    };
    if (!isOpen)
        return null;
    //Функция-заглушка для onChange, так как поля только для чтения
    const noop = () => { };
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50", children: _jsx(AnimatedComponent, { duration: 500, children: _jsxs("div", { className: "relative flex flex-col justify-between bg-white rounded-3xl w-[500px] max-w-[500px] gap-4 p-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-2xl font-bold", children: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0437\u0430\u043A\u0430\u0437\u0435" }), _jsx(IButton, { variant: "close", onClick: handleClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E", className: "border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full", children: _jsx(CloseIcon, {}) })] }), _jsx("div", { className: "p-4", children: loading ? (_jsx("p", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u0430..." })) : error ? (_jsx("p", { className: "text-red-500", children: error })) : orderData ? (_jsxs("div", { className: "space-y-4", children: [_jsx(TextInput, { label: "\u041C\u0430\u0440\u0448\u0440\u0443\u0442", value: `${orderData.departurePoint} → ${orderData.arrivalPoint}`, onChange: noop, readOnly: true, disabled: true, placeholder: "\u041C\u0430\u0440\u0448\u0440\u0443\u0442", required: false, requiredStar: false, type: "text", error: false, errorBorder: false, validationMessage: "" }), _jsx(TextInput, { label: "\u0422\u0430\u0440\u0438\u0444", value: `${orderData.tariff?.name || ''} - ${orderData.tariff?.description || ''} (${orderData.tariff?.price || 0} сом)`, onChange: noop, readOnly: true, disabled: true, placeholder: "\u0422\u0430\u0440\u0438\u0444", required: false, requiredStar: false, type: "text", error: false, errorBorder: false, validationMessage: "" }), _jsx(TextInput, { label: "\u0412\u0440\u0435\u043C\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F", value: orderData.departureTime, onChange: noop, readOnly: true, disabled: true, placeholder: "\u0412\u0440\u0435\u043C\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F", required: false, requiredStar: false, type: "date", error: false, errorBorder: false, validationMessage: "" }), _jsx(TextInput, { label: "\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435 (\u043C\u0438\u043D\u0443\u0442)", value: orderData.waitingTimeMinutes?.toString() || '0', onChange: noop, readOnly: true, disabled: true, placeholder: "\u041E\u0436\u0438\u0434\u0430\u043D\u0438\u0435", required: false, requiredStar: false, type: "number", error: false, errorBorder: false, validationMessage: "" }), orderData.tariff?.tariffAdditionalServices?.length > 0 && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-500 mb-2", children: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0443\u0441\u043B\u0443\u0433\u0438" }), _jsx("ul", { className: "list-disc ml-6", children: orderData.tariff.tariffAdditionalServices.map((service) => (_jsxs("li", { children: [service.service?.name, " \u2014 ", service.price, " \u0441\u043E\u043C"] }, service.uuid))) })] }))] })) : (_jsx("p", { children: "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F." })) }), _jsxs("div", { className: "flex justify-between p-4", children: [_jsx("button", { onClick: handlePrev, disabled: currentIndex === 0, className: "px-4 py-2 bg-gray-200 rounded disabled:opacity-50", children: "\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439" }), _jsx("button", { onClick: handleNext, disabled: currentIndex === notifications.length - 1, className: "px-4 py-2 bg-gray-200 rounded disabled:opacity-50", children: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439" })] })] }) }) }));
};
export default OrderInfoModal;
