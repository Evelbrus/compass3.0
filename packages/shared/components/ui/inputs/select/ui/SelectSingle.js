'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { ArrowIcon } from '@shared/components/ui/icon';
import Spinner from '@shared/components/ui/icon/Spinner';
import { cn } from '@shared/lib';
export const SelectSingle = ({ options, value, onChange, disabled = false, readOnly = false, className = '', placeholder = 'Выберите опцию', label, error = false, requiredStar = false, isLoading = false, message = 'Ошибка: Выберите корректное значение.', isSearchable = false, onInputChange, classNameLabel = 'block text-4 font-medium text-gray-500 mb-2', widthOpen = 'w-full', }) => {
    const selectRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    //Фильтрация (если нужна)
    useEffect(() => {
        if (isSearchable) {
            const lower = searchTerm.toLowerCase();
            setFilteredOptions(options.filter((option) => {
                //Если label — строка, ищем в ней
                if (typeof option.label === 'string') {
                    return option.label.toLowerCase().includes(lower);
                }
                //Если есть поле searchText для поиска
                if (option.searchText) {
                    return option.searchText.toLowerCase().includes(lower);
                }
                //Иначе — не подходит
                return false;
            }));
        }
        else {
            setFilteredOptions(options);
        }
    }, [searchTerm, options, isSearchable]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const toggleOpen = () => {
        if (!disabled && !isLoading && !readOnly) {
            setOpen((prev) => !prev);
        }
    };
    //Когда пользователь выбрал/кликнул по опции
    const handleOptionClick = (option) => {
        //Кликнули по другой опции
        if (value?.value !== option.value) {
            onChange(option);
        }
        else {
            //Нажали на ту же — сбрасываем в null
            onChange(null);
        }
        setOpen(false);
        setSearchTerm('');
    };
    //Классы кнопки
    const buttonClass = cn('w-full rounded p-2 focus:outline-none focus:ring flex justify-between items-center', error ? 'border-2 border-red-400' : 'border border-gray-300 focus:border-blue-300');
    return (_jsxs("div", { className: cn('relative', className), ref: selectRef, children: [label && (_jsxs("label", { className: cn(classNameLabel), children: [label, requiredStar && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] })), _jsxs("button", { type: "button", disabled: disabled || isLoading || readOnly, className: buttonClass, onClick: toggleOpen, "aria-haspopup": "listbox", "aria-expanded": open, children: [isLoading ? (_jsx(Spinner, { size: "small" })) : (_jsx("span", { className: cn(value ? '' : 'text-gray-400', 'truncate'), children: value?.label || placeholder })), !isLoading && _jsx(ArrowIcon, { open: open })] }), open && (_jsxs("div", { className: cn('absolute bg-white rounded-md z-50 max-h-60 overflow-auto mt-2 border border-gray-300', widthOpen), role: "listbox", children: [isSearchable && (_jsx("div", { className: "px-3 py-2 bg-gray-200", children: _jsx("input", { type: "text", value: searchTerm, onChange: (e) => {
                                setSearchTerm(e.target.value);
                                onInputChange?.(e);
                            }, placeholder: "\u041F\u043E\u0438\u0441\u043A...", className: "w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", "aria-label": "\u041F\u043E\u0438\u0441\u043A \u043E\u043F\u0446\u0438\u0439" }) })), _jsx("ul", { children: filteredOptions.map((option) => (_jsx("li", { className: cn('px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2', value?.value === option.value ? 'bg-gray-100 font-semibold' : ''), onClick: () => handleOptionClick(option), role: "option", "aria-selected": value?.value === option.value, children: option.label }, String(option.value)))) })] })), error && _jsx("p", { className: "text-red-500 text-sm mt-1", children: message })] }));
};
SelectSingle.displayName = 'SelectSingle';
