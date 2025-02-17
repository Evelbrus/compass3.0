'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useUnit } from 'effector-react';
import { TextInput } from '@shared/components/ui/inputs';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { $userUuid, $userFullName } from '@shared/lib/effector';
import { IButton } from '@shared/components/ui/buttons';
const ChangePasswordModal = ({ onClose }) => {
    //Получаем uuid и fullName пользователя из Effector‑хранилища
    const userUuid = useUnit($userUuid);
    const userFullName = useUnit($userFullName);
    console.log('userFullName', userFullName);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (newPassword !== confirmPassword) {
            setError('Новый пароль и подтверждение не совпадают');
            return;
        }
        if (!userUuid) {
            setError('Идентификатор пользователя не найден');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('/api/users/patch-user-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uuid: userUuid,
                    fullName: userFullName,
                    oldPassword,
                    newPassword,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || 'Ошибка обновления пароля');
            }
            else {
                setSuccess('Пароль успешно обновлён');
                //Если нужно, можно закрыть модалку через некоторое время:
                //setTimeout(onClose, 1500);
            }
        }
        catch (err) {
            setError('Ошибка сервера');
            console.error('Error updating password:', err);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4", children: _jsx(AnimatedComponent, { duration: 500, className: "w-[580px] max-h-[600px] flex justify-center", children: _jsxs("div", { className: "bg-white rounded-3xl p-8 relative w-full", children: [_jsx(IButton, { variant: "close", onClick: onClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E", className: "absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2", children: _jsx(CloseIcon, {}) }), _jsxs("h2", { className: "text-2xl font-semibold mb-4", children: ["\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u043B\u044F \u0434\u043B\u044F ", _jsx("br", {}), " ", userFullName] }), _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-4", children: [_jsx(TextInput, { label: "\u0421\u0442\u0430\u0440\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C:", type: "password", value: oldPassword, onChange: (value) => setOldPassword(value), required: true }), _jsx(TextInput, { label: "\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C:", type: "password", value: newPassword, onChange: (value) => setNewPassword(value), required: true }), _jsx(TextInput, { label: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u043B\u044F:", type: "password", value: confirmPassword, onChange: (value) => setConfirmPassword(value), required: true }), error && _jsx("p", { className: "text-red-600", children: error }), success && _jsx("p", { className: "text-green-600", children: success }), _jsx("div", { className: 'w-full flex flex-row justify-end', children: _jsx(IButton, { type: "submit", disabled: loading, className: "w-[205px] p-4 bg-[color:var(--button-secondary)]\n                text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)]\n                transition", children: loading ? 'Сохранение...' : 'Сохранить' }) })] })] }) }) }));
};
export default ChangePasswordModal;
