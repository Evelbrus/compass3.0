'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from '@shared/components/ui/icon';
import { TextInput } from '@shared/components/ui/inputs';
import { DriverAcceptanceStatus } from '@prisma/client';
import { formatDate } from '@shared/components/ui/inputs/date/functions/formatDate';
const OrderInfoModal = ({ isOpen, orderUuid, notificationUuid, onClose, isNotificationRead = false, }) => {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showAdditionalServices, setShowAdditionalServices] = useState(false);
    //Функция-заглушка для onChange (поля только для чтения)
    const noop = () => { };
    //Получение данных заказа при монтировании модального окна
    useEffect(() => {
        if (!orderUuid)
            return;
        setLoading(true);
        fetch(`/api/orders/modal/${orderUuid}`)
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
    }, [orderUuid]);
    //Обновление статуса водителя происходит только если уведомление еще не прочитано
    useEffect(() => {
        if (!orderUuid)
            return;
        if (isNotificationRead)
            return;
        fetch(`/api/orders/drivers/${orderUuid}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                orderUuid: orderUuid,
                driverProgressStatus: DriverAcceptanceStatus.TAKEN,
            }),
        })
            .then((res) => {
            if (!res.ok) {
                throw new Error(`Ошибка обновления статуса водителя: ${res.statusText}`);
            }
            return res.json();
        })
            .then((data) => {
            console.log('Статус водителя обновлён (PATCH):', data);
        })
            .catch((err) => {
            console.error('Ошибка при отправке PATCH-запроса для водителя:', err);
        });
    }, [orderData, isNotificationRead, orderUuid]);
    //Пометка уведомления как прочитанного (отправляется только если уведомление еще не прочитано)
    const markNotificationAsRead = async () => {
        try {
            const response = await fetch(`/api/notifications/${notificationUuid}`, {
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
    //Обработчик закрытия модального окна:
    //Если уведомление не прочитано – сначала помечаем его как прочитанное, затем закрываем модалку.
    const handleClose = async () => {
        if (!isNotificationRead) {
            await markNotificationAsRead();
        }
        onClose();
    };
    if (!isOpen)
        return null;
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsx(AnimatedComponent, { duration: 500, children: _jsxs("div", { className: "relative bg-white rounded-3xl max-w-3xl w-full p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-center flex-1", children: "\u0414\u0435\u0442\u0430\u043B\u0438 \u0437\u0430\u043A\u0430\u0437\u0430" }), _jsx(IButton, { variant: "close", onClick: handleClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E", className: "ml-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full", children: _jsx(CloseIcon, {}) })] }), loading ? (_jsx("p", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u0430..." })) : error ? (_jsx("p", { className: "text-red-500", children: error })) : orderData ? (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "text-center", children: _jsx(TextInput, { label: "\u0412\u0440\u0435\u043C\u044F \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F / Departure Time", value: formatDate(orderData.departureTime), onChange: noop, readOnly: true, disabled: true, type: "date", error: false, errorBorder: false, validationMessage: "" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(TextInput, { label: "\u041E\u0442\u043A\u0443\u0434\u0430", value: orderData.departurePoint?.address || '', onChange: noop, readOnly: true, disabled: true, type: "text", error: false, errorBorder: false, validationMessage: "" }), _jsx(TextInput, { label: "\u041A\u0443\u0434\u0430", value: orderData.arrivalPoint?.address || '', onChange: noop, readOnly: true, disabled: true, type: "text", error: false, errorBorder: false, validationMessage: "" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(TextInput, { label: "\u0424\u0418\u041E \u043A\u043B\u0438\u0435\u043D\u0442\u0430", value: orderData.createdBy?.fullName || '', onChange: noop, readOnly: true, disabled: true, type: "text", error: false, errorBorder: false, validationMessage: "" }), _jsx(TextInput, { label: "\u041D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430", value: orderData.createdBy?.phone || '', onChange: noop, readOnly: true, disabled: true, type: "text", error: false, errorBorder: false, validationMessage: "" })] }), _jsx("div", { children: _jsx(TextInput, { label: "\u0422\u0430\u0440\u0438\u0444", value: orderData.tariff
                                        ? `${orderData.tariff.name} (${orderData.tariff.price} сом)`
                                        : '', onChange: noop, readOnly: true, disabled: true, type: "text", error: false, errorBorder: false, validationMessage: "" }) }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(TextInput, { label: "\u041D\u043E\u043C\u0435\u0440 \u0440\u0435\u0439\u0441\u0430", value: orderData.flightNumber || '—', onChange: noop, readOnly: true, disabled: true, type: "text", error: false, errorBorder: false, validationMessage: "" }), _jsx("div", { children: _jsx(TextInput, { label: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435", value: orderData.description || '', onChange: noop, readOnly: true, disabled: true, type: "textarea", error: false, errorBorder: false, validationMessage: "", rows: 3 }) })] }), _jsxs("div", { children: [_jsx("button", { type: "button", onClick: () => setShowAdditionalServices((prev) => !prev), className: "px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition", children: showAdditionalServices ? 'Скрыть доп. услуги' : 'Показать доп. услуги' }), showAdditionalServices &&
                                        orderData.additionalServices &&
                                        orderData.additionalServices.length > 0 && (_jsx("div", { className: "mt-4 overflow-x-auto", children: _jsxs("table", { className: "min-w-full border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-2 border border-gray-300 text-left", children: "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435" }), _jsx("th", { className: "px-4 py-2 border border-gray-300 text-left", children: "\u0426\u0435\u043D\u0430" })] }) }), _jsx("tbody", { children: orderData.additionalServices.map((service) => (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-2 border border-gray-300", children: service.name }), _jsxs("td", { className: "px-4 py-2 border border-gray-300", children: [service.price, " \u0441\u043E\u043C"] })] }, service.uuid))) })] }) }))] }), _jsx("div", { className: "flex justify-center mt-6", children: !isNotificationRead ? (_jsx("button", { type: "button", onClick: handleClose, className: "px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition", children: "\u041E\u0437\u043D\u0430\u043A\u043E\u043C\u0438\u0442\u044C\u0441\u044F" })) : (_jsx("div", { onClick: onClose, className: "px-6 py-2 bg-green-500 text-white rounded cursor-default", children: "\u041E\u0437\u043D\u0430\u043C\u0438\u043B\u0441\u044F (\u041F\u0440\u043E\u0447\u0438\u0442\u0430\u043D\u043E)" })) }), _jsxs("div", { className: "text-sm text-gray-500", children: ["\u0421\u043E\u0437\u0434\u0430\u043D: ", formatDate(orderData.createdAt.toString()), " | \u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E:", ' ', formatDate(orderData.updatedAt.toString())] })] })) : (_jsx("p", { children: "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F." }))] }) }) }));
};
export default OrderInfoModal;
