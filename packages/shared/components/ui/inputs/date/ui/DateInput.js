import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DatePicker, { registerLocale } from 'react-datepicker';
import { enUS, ru } from 'date-fns/locale';
import { getLanguageCode } from '@shared/utils/language';
import { cn } from '@shared/lib';
export const DateInput = ({ selectedDate, onChange, label, placeholder = 'Выберите дату', className = '', classNameLabel = 'block text-4 font-medium text-gray-500 mb-2', classNameInput = 'w-full h-full rounded-md border border-gray-300 focus:outline-none cursor-pointer', lang = 'ru-RU', errorBorder = false, showTime = false, error = false, message = '', required = false, requiredStar = false, disabled = false, readOnly = false, maxDate, classNameBg = 'bg-white', classNamePlaceholder = 'focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold', classNameBorderRadius = 'rounded-md border border-gray-300', classNamePadding = 'px-3 py-[9px]', gap = '', }) => {
    const languageCode = getLanguageCode(lang);
    const locale = languageCode === 'ru' ? ru : enUS;
    registerLocale(languageCode, locale);
    const sharedClasses = cn('w-full', classNamePadding, classNameBg, classNameBorderRadius, classNamePlaceholder, errorBorder && 'border-red-500', error && 'border-red-500', disabled ? 'cursor-not-allowed' : readOnly && 'cursor-default');
    return (_jsxs("div", { className: `relative ${cn(className, gap)}`, children: [label && (_jsxs("label", { className: `${classNameLabel}`, htmlFor: `date-input-${label.replace(/\s+/g, '-').toLowerCase()}`, children: [label, requiredStar && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] })), _jsx(DatePicker, { id: `date-input-${label ? label.replace(/\s+/g, '-').toLowerCase() : 'date-input'}`, selected: selectedDate, onChange: (date) => onChange(date || null), disabled: disabled, readOnly: readOnly, placeholderText: placeholder, className: `${classNameInput} ${sharedClasses} ${error ? 'border-red-500' : ''}`, dateFormat: showTime ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd', locale: languageCode, showTimeSelect: showTime, timeFormat: "HH:mm", timeIntervals: 15, timeCaption: "\u0412\u0440\u0435\u043C\u044F", onKeyDown: (e) => e.preventDefault(), required: required, "aria-invalid": error, maxDate: maxDate }), error && message && _jsx("p", { className: "text-red-500 text-sm mt-1", children: message })] }));
};
DateInput.displayName = 'DateInput';
