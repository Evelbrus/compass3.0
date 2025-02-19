'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';
const WarningAdminModal = ({ onClose }) => {
    const [warningData, setWarningData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    //Функция загрузки данных предупреждения для администраторов/операторов
    //Здесь предполагается, что API возвращает нужную информацию по предупреждению.
    //Если данные берутся по какому-то конкретному идентификатору, можно передавать его через effector или через props.
    const fetchWarningData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/warnings`);
            if (!response.ok) {
                throw new Error(`Ошибка получения данных предупреждения: ${response.statusText}`);
            }
            const data = await response.json();
            setWarningData(data);
        }
        catch (err) {
            console.error('Ошибка при загрузке данных предупреждения:', err);
            setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных предупреждения');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchWarningData();
    }, []);
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsxs(AnimatedComponent, { duration: 500, className: "bg-white rounded-3xl p-8 w-full max-w-xl", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435" }), loading ? (_jsx("p", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445 \u043F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F..." })) : error ? (_jsx("p", { className: "text-red-500", children: error })) : warningData ? (_jsxs("div", { children: [_jsxs("p", { children: [_jsx("strong", { children: "ID \u0437\u0430\u043A\u0430\u0437\u0430:" }), " ", warningData.orderId] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435:" }), " ", warningData.message || 'Нет подробностей'] }), _jsxs("p", { children: [_jsx("strong", { children: "\u0414\u0430\u0442\u0430:" }), " ", new Date(warningData.createdAt).toLocaleString()] })] })) : (_jsx("p", { children: "\u0414\u0430\u043D\u043D\u044B\u0445 \u043F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E." })), _jsx(IButton, { onClick: onClose, className: "mt-4", children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })] }) }));
};
export default WarningAdminModal;
