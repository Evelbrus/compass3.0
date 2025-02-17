'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormContext, Controller } from 'react-hook-form';
import { ArrowIcon } from '@shared/components/ui/icon';
import { CheckboxInput } from '@shared/components/ui/inputs';
export const Selector = ({ name, label, options = [], selectedValues, placeholder, icon, mode = 'rows', status = 'default', isOpen, onToggle, onSelectionChange, }) => {
    const { control } = useFormContext();
    const handleToggleOption = (optionValue) => {
        if (onSelectionChange) {
            onSelectionChange(optionValue);
        }
    };
    return (_jsx(Controller, { name: name, control: control, render: () => (_jsxs("div", { className: `w-full border rounded-lg bg-white transition-colors duration-300`, "data-mode": mode, "data-status": status, "data-is-active": isOpen, children: [_jsxs("div", { className: "flex items-center justify-between gap-2 p-2 cursor-pointer", onClick: onToggle, "data-selected": selectedValues.length > 0, children: [icon && _jsx("span", { className: "mr-2", children: icon }), _jsx("span", { className: "text-[14px] font-[500] leading-[24px] text-left font-sans", children: placeholder || label }), _jsx(ArrowIcon, {})] }), _jsx("div", { className: `transition-all duration-500 ease-in-out overflow-hidden space-y-2 ${isOpen ? 'p-2 max-h-52 opacity-100 delay-100' : 'max-h-0 opacity-0 delay-0'}`, style: { maxHeight: isOpen ? '300px' : '0', overflowY: 'auto' }, children: options.length > 0 ? (options.map((option) => (_jsx(Controller, { name: name, control: control, render: () => (_jsx(CheckboxInput, { label: option.label, checked: selectedValues.includes(option.value), onChange: () => handleToggleOption(option.value), className: "w-full text-[14px] font-[500] leading-[24px] text-left font-sans", position: "right" })) }, option.value)))) : (_jsx("p", { className: "p-2 text-gray-500", children: "\u041D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0445 \u043E\u043F\u0446\u0438\u0439" })) })] })) }));
};
Selector.displayName = 'Selector';
