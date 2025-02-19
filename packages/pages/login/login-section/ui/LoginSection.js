'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { showToast } from '@shared/components/toast/ToastManager';
import { IButton } from '@shared/components/ui/buttons';
import { TextInput } from '@shared/components/ui/inputs';
import { WelcomeIcon } from '@shared/components/ui/icon';
const LoginSection = () => {
    const router = useRouter();
    const { control, handleSubmit, clearErrors, formState: { errors }, } = useForm({
        defaultValues: {
            username: '',
            password: '',
        },
    });
    const [loading, setLoading] = useState(false);
    const [generalError, setGeneralError] = useState(null);
    const [successLogin, setSuccessLogin] = useState(false);
    const onSubmit = async (data) => {
        clearErrors();
        setGeneralError(null);
        setLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.username,
                    password: data.password,
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Ошибка авторизации');
            }
            showToast.success('Вход выполнен успешно!');
            setSuccessLogin(true);
            //Перенаправление с учетом сессии
            setTimeout(() => {
                router.push('/');
            }, 2500);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Ошибка:', error.message);
                setGeneralError(error.message);
                showToast.error(error.message);
            }
            else {
                console.error('Неизвестная ошибка:', error);
                setGeneralError('Ошибка сервера');
                showToast.error('Ошибка сервера');
            }
        }
        finally {
            setLoading(false);
        }
    };
    const handleForgotPassword = () => {
        showToast.info('Функционал восстановления пароля в разработке.');
    };
    const navigateToRegister = () => {
        router.push('/register');
    };
    if (successLogin) {
        return (_jsx("div", { className: "w-full h-full", children: _jsx("div", { className: "absolute inset-0 w-full h-full flex items-center justify-center bg-white z-50", children: _jsx(WelcomeIcon, {}) }) }));
    }
    return (_jsx("div", { className: "relative inset-0 w-full flex items-center justify-center transition-all bg-[color(--background)] z-50 px-4", children: _jsx("div", { role: "dialog", "aria-modal": "true", className: "bg-white p-12 rounded-lg w-full max-w-[500px] relative", children: _jsxs("form", { className: "w-full flex flex-col", "aria-live": "polite", onSubmit: handleSubmit(onSubmit), children: [_jsx("h2", { className: "text-center font-semibold text-2xl text-gray-800 mb-4", children: "\u0412\u0445\u043E\u0434" }), _jsx(Controller, { name: "username", control: control, rules: {
                            required: 'Введите email.',
                        }, render: ({ field }) => (_jsxs("div", { className: "flex flex-col", children: [_jsx(TextInput, { ...field, className: "rounded-lg p-4", error: !!errors.username, disabled: loading, placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 email" }), _jsx("p", { className: "text-sm text-red-500 min-h-[20px] my-1", children: errors.username?.message })] })) }), _jsx(Controller, { name: "password", control: control, rules: {
                            required: 'Введите пароль.',
                            minLength: {
                                value: 6,
                                message: 'Минимальная длина пароля 6 символов.',
                            },
                        }, render: ({ field }) => (_jsxs("div", { className: "flex flex-col", children: [_jsx(TextInput, { ...field, className: "rounded-lg p-4", type: "password", error: !!errors.password, disabled: loading, placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C" }), _jsx("p", { className: "text-sm text-red-500 min-h-[20px] my-1", children: errors.password?.message })] })) }), _jsx(IButton, { type: "button", onClick: handleForgotPassword, className: "w-full text-sm text-right text-black hover:underline my-2", textClassName: "w-full text-end justify-end", children: "\u0417\u0430\u0431\u044B\u043B\u0438 \u043F\u0430\u0440\u043E\u043B\u044C?" }), generalError && _jsx("p", { className: "text-sm text-red-500", children: generalError }), _jsx(IButton, { type: "submit", "aria-busy": loading, disabled: loading, className: "h-16 px-6 py-3 bg-[color:var(--button-secondary)]\n            text-[color:var(--text-white)] rounded-lg\n            hover:bg-[color:var(--button-secondary-hover)] transition", textClassName: "w-full text-center justify-center", children: "\u0412\u043E\u0439\u0442\u0438" }), _jsxs("div", { className: "flex justify-center text-sm my-2", children: [_jsx("p", { children: "\u0423 \u0432\u0430\u0441 \u0435\u0449\u0435 \u043D\u0435\u0442 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430?\u00A0" }), _jsx(IButton, { type: "button", onClick: navigateToRegister, className: "text-sm text-right text-black hover:underline", children: "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0443\u0439\u0442\u0435\u0441\u044C" })] })] }) }) }));
};
export default LoginSection;
