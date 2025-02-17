'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { ArrowIcon } from '@shared/components/ui/icon';
export const SelectMultiple = ({ options, value, onChange, disabled = false, className = '', classNameLabel = 'text-4 font-medium text-gray-500 mb-2', classNamePlaceholder = 'text-4 text-[#2A3037] font-extrabold', classNameBorderRadius = 'rounded-md border', classNameTagUl = 'bg-gray-50 border-2 border-black', classNameTagLi = 'hover:bg-gray-200', phoneSelect = '', placeholder = 'Выберите опции', label, error = false, errorBorder = false, hideArrow = false, getIcon, isSearchable = false, requiredStar = false, message = 'Ошибка: Выберите корректные значения.', }) => {
    const selectMultipleRef = useRef(null);
    const dropdownRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [dropdownDirection, setDropdownDirection] = useState('down');
    useEffect(() => {
        if (isSearchable) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const filtered = options.filter((option) => {
                if (typeof option.label === 'string') {
                    return option.label.toLowerCase().includes(lowerSearchTerm);
                }
                return false;
            });
            setFilteredOptions(filtered);
        }
        else {
            setFilteredOptions(options);
        }
    }, [searchTerm, options, isSearchable]);
    const handleClickOutside = (event) => {
        if (selectMultipleRef.current && !selectMultipleRef.current.contains(event.target)) {
            setOpen(false);
            setSearchTerm('');
        }
    };
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const toggleOpen = () => {
        if (!disabled) {
            setOpen((prev) => !prev);
        }
    };
    const handleOptionClick = (option) => {
        const isAlreadySelected = value.some((selected) => selected.value === option.value);
        if (isAlreadySelected) {
            onChange(value.filter((selected) => selected.value !== option.value));
        }
        else {
            onChange([...value, option]);
        }
        setOpen(false);
        setSearchTerm('');
    };
    const renderIcon = (option) => {
        if (!getIcon)
            return null;
        return getIcon(option.value);
    };
    const determineDropdownDirection = () => {
        const selectRect = selectMultipleRef.current?.getBoundingClientRect();
        const dropdownHeight = 240;
        if (selectRect) {
            const spaceBelow = window.innerHeight - selectRect.bottom;
            const spaceAbove = selectRect.top;
            if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
                setDropdownDirection('up');
            }
            else {
                setDropdownDirection('down');
            }
        }
    };
    useEffect(() => {
        if (open) {
            determineDropdownDirection();
            window.addEventListener('resize', determineDropdownDirection);
        }
        else {
            window.removeEventListener('resize', determineDropdownDirection);
        }
        return () => {
            window.removeEventListener('resize', determineDropdownDirection);
        };
    }, [open]);
    const removeSelected = (option) => {
        onChange(value.filter((selected) => selected.value !== option.value));
    };
    const renderSelectedTags = () => {
        if (value.length > 0) {
            return (_jsx("div", { className: "flex flex-wrap gap-2 mb-2", children: value.map((val) => (_jsxs("div", { className: "flex items-center bg-transparent border border-gray-500 text-black px-4 py-2 rounded-full", children: [val.label, _jsx("button", { type: "button", className: "ml-2 text-5 text-red-500 hover:text-red-700 focus:outline-none", onClick: () => removeSelected(val), "aria-label": `Удалить ${val.label}`, children: "\u00D7" })] }, val.value))) }));
        }
        return null;
    };
    const renderPlaceholder = () => {
        return _jsx("span", { className: "text-gray-500", children: placeholder });
    };
    return (_jsxs("div", { className: `relative inline-block text-left w-full ${className} ${errorBorder ? 'border-2 border-red-400' : 'border-none'}`, ref: selectMultipleRef, children: [label && (_jsxs("div", { className: `${classNameLabel}`, children: [label, " ", requiredStar && _jsx("span", { className: "text-red-500", children: "*" })] })), renderSelectedTags(), _jsxs("button", { type: "button", disabled: disabled, className: `w-full bg-white px-3 py-2 flex justify-between items-center focus:bg-[var(--date-secondary-focus)] 
        ${phoneSelect} 
        ${classNameBorderRadius} 
        ${disabled
                    ? 'opacity-70 cursor-not-allowed'
                    : error
                        ? 'border-red-500 text-red-500'
                        : 'border-gray-300 text-black'}`, onClick: toggleOpen, children: [_jsx("span", { className: `truncate text-center cursor-pointer ${classNamePlaceholder}`, children: renderPlaceholder() }), !hideArrow && _jsx(ArrowIcon, { open: open })] }), open && (_jsxs("div", { ref: dropdownRef, className: `absolute bg-white rounded-3xl shadow-lg flex flex-col z-50 w-full max-h-60 overflow-y-auto ${classNameTagUl} ${dropdownDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'}`, children: [isSearchable && (_jsx("div", { className: "px-4 py-2 bg-gray-200", children: _jsx("input", { type: "text", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), placeholder: "\u041F\u043E\u0438\u0441\u043A...", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }) })), _jsx("ul", { className: "flex-1 overflow-y-auto", children: filteredOptions.map((option) => {
                            const isSelected = value.some((selected) => selected.value === option.value);
                            return (_jsxs("li", { className: `px-4 py-3 w-full hover:bg-gray-100 cursor-pointer flex items-center gap-4 ${classNameTagLi} ${isSelected ? 'bg-gray-100 font-semibold' : ''}`, onClick: () => handleOptionClick(option), children: [renderIcon(option), _jsx("span", { className: "flex w-full text-left text-black truncate", children: option.label })] }, option.value.toString()));
                        }) })] })), error && _jsx("div", { className: "text-red-500 text-sm mt-1", children: message })] }));
};
