'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState, useEffect } from 'react';
import { TextInput } from '@shared/components/ui/inputs';
import { SelectSingle } from '@shared/components/ui/inputs';
import { cn } from '@shared/lib';
import { countryData } from '@shared/components/ui/inputs/phone/data/PhoneData';
import { countryOptions } from '@shared/components/ui/inputs/phone';
import { formatByCountry } from '@shared/components/ui/inputs/phone';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';
export const PhoneInput = ({ value, onChange, label, required = false, error = false, disabled = false, readOnly = false, classNameWidthPhone = '', classNameLabel = 'block text-4 font-medium text-gray-500 mb-2', requiredStar = false, message = 'Ошибка: Выберите корректное значение.', }) => {
    //Исходная страна — по входному value (если +7 => Россия, +996 => Киргизия)
    const initialCountry = useMemo(() => {
        return countryData.find((country) => value?.startsWith(country.dialCode)) || countryData[0];
    }, [value]);
    const [selectedCountry, setSelectedCountry] = useState(initialCountry);
    const [localNumber, setLocalNumber] = useState(value?.startsWith(initialCountry.dialCode) ? value.replace(initialCountry.dialCode, '') : '');
    useEffect(() => {
        if (value && value.trim() !== '') {
            const c = countryData.find((x) => value.startsWith(x.dialCode)) || initialCountry;
            const local = value.startsWith(c.dialCode) ? value.replace(c.dialCode, '') : '';
            setSelectedCountry(c);
            setLocalNumber(local);
        }
    }, [value, initialCountry]);
    const handleCountryChange = (option) => {
        if (!option)
            return;
        const newCountry = countryData.find((c) => c.code === option.value) || initialCountry;
        setSelectedCountry(newCountry);
        setLocalNumber('');
        onChange(newCountry.dialCode);
    };
    //Изменили сигнатуру, добавив | bigint | null, и обработали случай, когда значение null
    const handleNumberChange = (val) => {
        if (val === null) {
            setLocalNumber('');
            onChange('');
            return;
        }
        const inputNumber = String(val).replace(/\D/g, '');
        const limitedNumber = inputNumber.slice(0, selectedCountry.maxLength);
        setLocalNumber(limitedNumber);
        if (limitedNumber) {
            onChange(selectedCountry.dialCode + limitedNumber);
        }
        else {
            onChange('');
        }
    };
    const formattedValue = useMemo(() => {
        return formatByCountry(selectedCountry.code, localNumber);
    }, [selectedCountry, localNumber]);
    const filteredCountryOptions = useMemo(() => {
        return countryOptions.map((opt) => ({
            ...opt,
            label: opt.compactLabel,
        }));
    }, []);
    const inputId = `input-${label ? label.replace(/\s+/g, '-').toLowerCase() : 'text-input'}`;
    return (_jsxs("div", { className: "relative flex flex-col", children: [label && (_jsxs("label", { className: cn(classNameLabel), htmlFor: inputId, children: [label, requiredStar && _jsx("span", { className: "text-red-500", children: "*" })] })), _jsxs("div", { className: "flex items-start space-x-2", children: [_jsx("div", { className: cn('w-1/6 min-w-[120px] max-w-[120px]', classNameWidthPhone), children: _jsx(SelectSingle, { options: filteredCountryOptions, label: "", value: {
                                value: selectedCountry.code,
                                label: (_jsxs("div", { className: "flex items-center flex-shrink-0", children: [_jsx(LazyImage, { src: selectedCountry.flag, alt: selectedCountry.name, className: "w-[24px] h-[24px] mr-1 object-cover", placeholder: _jsx(Skeleton, { width: 24, height: 24 }) }), _jsx("span", { children: selectedCountry.dialCode })] })),
                            }, onChange: handleCountryChange, disabled: disabled, readOnly: readOnly, widthOpen: 'w-[300px]' }) }), _jsx("div", { className: "w-full", children: _jsx(TextInput, { type: "text", value: formattedValue, onChange: handleNumberChange, placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430", required: required, disabled: disabled, readOnly: readOnly, errorBorder: error, message: message, error: error, className: "w-full" }) })] })] }));
};
PhoneInput.displayName = 'PhoneInput';
