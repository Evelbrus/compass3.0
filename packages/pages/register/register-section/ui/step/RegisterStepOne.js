'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextInput } from '@shared/components/ui/inputs';
import { validateEmail, validatePassword } from '@shared/utils/validations';
const FIELD_EMAIL = 'email';
const FIELD_PASSWORD = 'password';
const FIELD_CONFIRM_PASSWORD = 'confirmPassword';
const RegisterStepOne = () => {
    const { control, clearErrors, getValues } = useFormContext();
    const firstInputRef = useRef(null);
    return (_jsxs("div", { children: [_jsx(Controller, { name: FIELD_EMAIL, control: control, defaultValue: "", rules: {
                    required: 'Введите email.',
                    validate: (value) => validateEmail(value) || 'Некорректный email.',
                }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(TextInput, { label: "Email:", type: "email", value: typeof field.value === 'string' ? field.value : '', ref: firstInputRef, placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 email", error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_EMAIL);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }), _jsx(Controller, { name: FIELD_PASSWORD, control: control, defaultValue: "", rules: {
                    required: 'Введите пароль.',
                    validate: (value) => validatePassword(value ?? '') || 'Пароль не удовлетворяет требованиям.',
                }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(TextInput, { label: "\u041F\u0430\u0440\u043E\u043B\u044C:", type: "password", value: typeof field.value === 'string' ? field.value : '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C", error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_PASSWORD);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }), _jsx(Controller, { name: FIELD_CONFIRM_PASSWORD, control: control, defaultValue: "", rules: {
                    required: 'Подтвердите пароль.',
                    validate: (value) => value === getValues(FIELD_PASSWORD) || 'Пароли не совпадают.',
                }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(TextInput, { label: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u043B\u044F:", type: "password", value: typeof field.value === 'string' ? field.value : '', placeholder: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C", error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_CONFIRM_PASSWORD);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) })] }));
};
export default RegisterStepOne;
