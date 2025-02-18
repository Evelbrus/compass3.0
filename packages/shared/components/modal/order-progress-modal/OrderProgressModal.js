'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useUnit } from 'effector-react';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { $driverOrderUuid } from '@shared/lib/effector';
//Здесь предполагается, что в вашей схеме OrderStatus (или аналогичном enum)
//заданы значения, соответствующие этапам выполнения заказа.
//Если OrderStatus не содержит нужных значений, можно создать свой enum или тип.
export var DriverProgressStatus;
(function (DriverProgressStatus) {
    DriverProgressStatus["ON_THE_WAY"] = "ON_THE_WAY";
    DriverProgressStatus["ARRIVED"] = "ARRIVED";
    DriverProgressStatus["PICKED_UP"] = "PICKED_UP";
    DriverProgressStatus["COMPLETED"] = "COMPLETED";
})(DriverProgressStatus || (DriverProgressStatus = {}));
const OrderProgressModal = ({ onClose }) => {
    const driverOrderUuid = useUnit($driverOrderUuid);
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [patchLoading, setPatchLoading] = useState(false);
    const [error, setError] = useState(null);
    const [statusUpdateMsg, setStatusUpdateMsg] = useState(null);
    //Функция для загрузки данных заказа по driverOrderUuid
    const fetchOrderData = async () => {
        if (!driverOrderUuid)
            return;
        setLoading(true);
        try {
            const response = await fetch(`/api/orders/${driverOrderUuid}`);
            if (!response.ok) {
                throw new Error(`Ошибка получения заказа: ${response.statusText}`);
            }
            const data = await response.json();
            setOrderData(data);
        }
        catch (err) {
            console.error('Ошибка при загрузке данных заказа:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных заказа');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchOrderData();
    }, [driverOrderUuid]);
    //Функция для обновления статуса заказа через PATCH-запрос
    const updateOrderStatus = async (newStatus) => {
        if (!driverOrderUuid)
            return;
        setPatchLoading(true);
        setStatusUpdateMsg(null);
        try {
            const response = await fetch(`/api/orders/${driverOrderUuid}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                //Здесь передаем новый статус заказа; формат запроса зависит от вашей реализации API
                body: JSON.stringify({ driverProgressStatus: newStatus }),
            });
            if (!response.ok) {
                throw new Error(`Ошибка обновления статуса: ${response.statusText}`);
            }
            const data = await response.json();
            setStatusUpdateMsg(`Статус обновлен на ${newStatus}`);
            //Обновляем локальные данные заказа
            await fetchOrderData();
        }
        catch (err) {
            console.error('Ошибка при обновлении статуса заказа:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при обновлении статуса заказа');
        }
        finally {
            setPatchLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsxs(AnimatedComponent, { duration: 500, className: "bg-white rounded-3xl p-8 w-full max-w-xl", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0437\u0430\u043A\u0430\u0437\u0430" }), loading ? (_jsx("p", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u0430..." })) : error ? (_jsx("p", { className: "text-red-500", children: error })) : orderData ? (_jsxs("div", { children: [_jsxs("p", { children: [_jsx("strong", { children: "ID \u0437\u0430\u043A\u0430\u0437\u0430:" }), " ", orderData.uuid] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0441\u0442\u0430\u0442\u0443\u0441:" }), " ", orderData.status] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0414\u0430\u0442\u0430 \u043F\u043E\u0434\u0430\u0447\u0438:" }), " ", new Date(orderData.departureTime).toLocaleString()] }), _jsxs("div", { className: "mt-4", children: [_jsx("p", { className: "mb-2 font-semibold", children: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0441\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u043A\u0430\u0437\u0430:" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(IButton, { onClick: () => updateOrderStatus(DriverProgressStatus.ON_THE_WAY), disabled: patchLoading, children: "ON THE WAY" }), _jsx(IButton, { onClick: () => updateOrderStatus(DriverProgressStatus.ARRIVED), disabled: patchLoading, children: "ARRIVED" }), _jsx(IButton, { onClick: () => updateOrderStatus(DriverProgressStatus.PICKED_UP), disabled: patchLoading, children: "PICKED UP" }), _jsx(IButton, { onClick: () => updateOrderStatus(DriverProgressStatus.COMPLETED), disabled: patchLoading, children: "COMPLETED" })] }), patchLoading && _jsx("p", { className: "mt-2", children: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u0430..." }), statusUpdateMsg && _jsx("p", { className: "mt-2 text-green-600", children: statusUpdateMsg })] })] })) : (_jsx("p", { children: "\u0414\u0430\u043D\u043D\u044B\u0445 \u043E \u0437\u0430\u043A\u0430\u0437\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E." })), _jsx(IButton, { onClick: onClose, className: "mt-4", children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })] }) }));
};
export default OrderProgressModal;
