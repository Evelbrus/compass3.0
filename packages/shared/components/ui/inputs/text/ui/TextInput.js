'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { cn } from '@shared/lib';
//Функция форматирования даты в "YYYY-MM-DD" (для отображения в input type="date")
const formatDateForInput = (value) => {
    if (!value)
        return '';
    if (typeof value === 'string')
        return value.split('T')[0] ?? '';
    if (value instanceof Date)
        return value.toISOString().split('T')[0] || '';
    return '';
};
//Функция форматирования даты в "YYYY-MM-DDT00:00:00.000Z" (для сохранения на бэкенд)
const formatDateForBackend = (value) => {
    return new Date(value).toISOString();
};
export const TextInput = ({ label, placeholder, value, onChange, required = false, disabled = false, readOnly = false, type = 'text', error = false, message = '', minLength, maxLength, onKeyDown, rows = 3, classNameLabel = 'block text-4 font-medium text-gray-500 mb-2', inputClass = cn('w-full rounded p-2 focus:outline-none focus:ring', error ? 'border-2 border-red-400' : 'border border-gray-300 focus:border-blue-300'), step, }) => {
    const inputRef = useRef(null);
    //Состояние для переключения видимости пароля
    const [showPassword, setShowPassword] = useState(false);
    /**Приведение значения к строке */
    const getFormattedValue = () => {
        if (type === 'date')
            return formatDateForInput(value) ?? '';
        if (typeof value === 'number')
            return value.toString();
        if (typeof value === 'string')
            return value;
        return '';
    };
    return (_jsxs("div", { className: "w-full relative", children: [label && (_jsxs("label", { className: cn(classNameLabel), children: [label, " ", required && _jsx("span", { className: "text-red-500", children: "*" })] })), _jsxs("div", { className: cn('flex flex-row justify-between', inputClass), children: [_jsx("input", { ref: inputRef, 
                        //Если тип "password", меняем тип в зависимости от showPassword
                        type: type === 'password' ? (showPassword ? 'text' : 'password') : type, value: getFormattedValue() ?? '', onChange: (e) => {
                            let newValue = e.target.value ?? '';
                            if (type === 'number') {
                                newValue = e.target.value;
                            }
                            else if (type === 'date') {
                                newValue = formatDateForBackend(e.target.value);
                            }
                            onChange(newValue);
                        }, required: required, disabled: disabled, readOnly: readOnly, placeholder: placeholder, minLength: minLength, maxLength: maxLength, onKeyDown: onKeyDown, "aria-invalid": error, step: type === 'number' ? (step ? step.toString() : 'any') : undefined, className: 'w-full' }), type === 'password' && (_jsx("button", { type: "button", onClick: () => setShowPassword((prev) => !prev), 
                        //Кнопка расположена внутри инпута: абсолютное позиционирование по правому краю и по всей высоте, с центровкой содержимого
                        className: "relative px-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none", children: showPassword ? (
                        //Иконка закрытого глаза (скрытый пароль)
                        _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.282.238-2.5.675-3.625M9.88 9.88A3 3 0 1114.12 14.12M17.325 6.675A9.969 9.969 0 0121 10c0 5.523-4.477 10-10 10a9.969 9.969 0 01-3.325-.675" }) })) : (
                        //Иконка открытого глаза (видимый пароль)
                        _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: [_jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" }), _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" })] })) }))] }), error && message && _jsx("p", { className: "text-red-500 text-sm mt-1", children: message })] }));
};
TextInput.displayName = 'TextInput';
