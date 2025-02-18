'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useUnit } from 'effector-react';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { $driverOrderUuid } from '@shared/lib/effector';
const OrderInfoModal = ({ onClose }) => {
    const driverOrderUuid = useUnit($driverOrderUuid);
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    //При монтировании модалки отправляем PATCH-запрос для обновления заказа
    useEffect(() => {
        if (!driverOrderUuid)
            return;
        //Пример PATCH-запроса, который может помечать заказ как "просмотренный" водителем.
        //Измените URL и тело запроса согласно вашим требованиям.
        fetch(`/api/orders/${driverOrderUuid}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                //Например, устанавливаем поле driverViewed в true
                driverViewed: true,
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
    }, [driverOrderUuid]);
    //Получение данных заказа
    useEffect(() => {
        if (!driverOrderUuid)
            return;
        setLoading(true);
        fetch(`/api/orders/${driverOrderUuid}`)
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
    }, [driverOrderUuid]);
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsxs(AnimatedComponent, { duration: 500, className: "bg-white rounded-3xl p-8 w-full max-w-xl", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u0437\u0430\u043A\u0430\u0437\u0435" }), loading ? (_jsx("p", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u0430..." })) : error ? (_jsx("p", { className: "text-red-500", children: error })) : orderData ? (_jsxs("div", { children: [_jsxs("p", { children: [_jsx("strong", { children: "ID \u0437\u0430\u043A\u0430\u0437\u0430:" }), " ", orderData.uuid] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0421\u0442\u0430\u0442\u0443\u0441:" }), " ", orderData.status] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0414\u0430\u0442\u0430 \u043F\u043E\u0434\u0430\u0447\u0438:" }), " ", new Date(orderData.departureTime).toLocaleString()] })] })) : (_jsx("p", { children: "\u0414\u0430\u043D\u043D\u044B\u0435 \u043E \u0437\u0430\u043A\u0430\u0437\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B." })), _jsx(IButton, { onClick: onClose, className: "mt-4", children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })] }) }));
};
export default OrderInfoModal;
