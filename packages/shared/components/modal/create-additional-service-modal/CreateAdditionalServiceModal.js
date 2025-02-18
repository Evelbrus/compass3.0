'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { TextInput } from '@shared/components/ui/inputs';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { useUnit } from 'effector-react';
import { $additionalServiceUuid, setAdditionalServiceUuid } from '@shared/lib/effector/state/state';
const CreateAdditionalServiceModal = ({ onClose }) => {
    const uuid = useUnit($additionalServiceUuid);
    const [serviceName, setServiceName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    //Если это редактирование, получаем данные услуги
    useEffect(() => {
        if (uuid) {
            const fetchService = async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/additional-services/${uuid}`);
                    if (!response.ok)
                        throw new Error('Ошибка загрузки услуги');
                    const data = await response.json();
                    setServiceName(data.name);
                }
                catch (err) {
                    setError('Ошибка загрузки данных');
                }
                finally {
                    setLoading(false);
                }
            };
            fetchService();
        }
    }, [uuid]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!serviceName) {
            setError('Название услуги обязательно');
            return;
        }
        setLoading(true);
        try {
            const method = uuid ? 'PUT' : 'POST';
            const url = uuid ? `/api/additional-services/${uuid}` : '/api/additional-services';
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: serviceName }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.message || `Ошибка ${uuid ? 'обновления' : 'создания'} услуги`);
            }
            else {
                setSuccess(`Услуга успешно ${uuid ? 'обновлена' : 'добавлена'}`);
                setTimeout(() => {
                    setAdditionalServiceUuid(null);
                    onClose();
                }, 1500);
            }
        }
        catch (err) {
            setError('Ошибка сервера');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsx(AnimatedComponent, { duration: 500, className: "w-[580px] max-h-[600px] flex justify-center", children: _jsxs("div", { className: "bg-white rounded-3xl p-8 relative w-full", children: [_jsx(IButton, { variant: "close", onClick: () => {
                            setAdditionalServiceUuid(null);
                            onClose();
                        }, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E", className: "absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2", children: _jsx(CloseIcon, {}) }), _jsx("h2", { className: "text-2xl font-semibold mb-4", children: uuid ? 'Редактировать услугу' : 'Добавить услугу' }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [_jsx(TextInput, { label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0443\u0441\u043B\u0443\u0433\u0438:", value: serviceName, onChange: (value) => setServiceName(value), required: true }), error && _jsx("p", { className: "text-red-600", children: error }), success && _jsx("p", { className: "text-green-600", children: success }), _jsx("div", { className: 'w-full flex flex-row justify-end', children: _jsx(IButton, { type: "submit", disabled: loading, className: "w-[205px] p-4 bg-[color:var(--button-secondary)]\n                text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)]\n                transition", children: loading ? 'Сохранение...' : uuid ? 'Обновить' : 'Создать' }) })] })] }) }) }));
};
export default CreateAdditionalServiceModal;
