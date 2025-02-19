'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useUnit } from 'effector-react';
import { IButton } from '@shared/components/ui/buttons';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { $driverOrderNotifications } from '@shared/lib/effector';
const WarningModal = ({ onClose }) => {
    //Получаем массив уведомлений водителя из Effector‑хранилища
    const notifications = useUnit($driverOrderNotifications);
    const [currentIndex, setCurrentIndex] = useState(0);
    //Если уведомлений нет — ничего не отображаем
    if (notifications.length === 0) {
        return null;
    }
    //Текущее уведомление
    const currentNotification = notifications[currentIndex];
    const orderId = currentNotification.orderId;
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    //Функция загрузки данных заказа
    const fetchOrderData = async () => {
        if (!orderId)
            return;
        setLoading(true);
        try {
            const response = await fetch(`/api/orders/${orderId}`);
            if (!response.ok) {
                throw new Error(`Ошибка получения данных заказа: ${response.statusText}`);
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
    }, [orderId]);
    //Функция для пометки уведомления как прочитанного
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
        }
    };
    //Переход к следующему уведомлению
    const handleNext = () => {
        if (currentIndex < notifications.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };
    //Закрытие модалки + пометка уведомления как прочитанного
    const handleClose = async () => {
        await markNotificationAsRead();
        onClose();
    };
    return (_jsx("div", { className: "fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-50 p-4", children: _jsxs(AnimatedComponent, { duration: 500, className: "bg-white rounded-3xl p-8 w-full max-w-xl", children: [notifications.length > 1 && (_jsxs("div", { className: "flex justify-between mb-4", children: [_jsx(IButton, { onClick: handlePrev, disabled: currentIndex === 0, children: "\u041D\u0430\u0437\u0430\u0434" }), _jsx(IButton, { onClick: handleNext, disabled: currentIndex === notifications.length - 1, children: "\u0412\u043F\u0435\u0440\u0451\u0434" })] })), _jsxs("h2", { className: "text-xl font-bold mb-4", children: ["\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435 ", currentIndex + 1, " \u0438\u0437 ", notifications.length] }), loading ? (_jsx("p", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u0430..." })) : error ? (_jsx("p", { className: "text-red-500", children: error })) : orderData ? (_jsxs("div", { children: [_jsxs("p", { children: [_jsx("strong", { children: "ID \u0437\u0430\u043A\u0430\u0437\u0430:" }), " ", orderData.uuid] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435:" }), " ", currentNotification.message || 'Нет подробностей'] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0414\u0430\u0442\u0430:" }), " ", new Date(currentNotification.createdAt).toLocaleString()] })] })) : (_jsx("p", { children: "\u0414\u0430\u043D\u043D\u044B\u0445 \u043E \u0437\u0430\u043A\u0430\u0437\u0435 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E." })), _jsx(IButton, { onClick: handleClose, className: "mt-4", children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })] }) }));
};
export default WarningModal;
