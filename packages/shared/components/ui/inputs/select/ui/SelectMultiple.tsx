'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowIcon } from '@shared/components/ui/icon';
import { SelectMultipleProps } from '@shared/components/ui/inputs/select/types/SelectTypes';
import { SelectOption } from '@shared/lib/effector';

export const SelectMultiple = <T extends string | number>({
  options,
  value,
  onChange,
  disabled = false,
  className = '',
  classNameLabel = 'text-4 font-medium text-gray-500 mb-2',
  classNamePlaceholder = 'text-4 text-[#2A3037] font-extrabold',
  classNameBorderRadius = 'rounded-md border',
  classNameTagUl = 'bg-gray-50 border-2 border-black',
  classNameTagLi = 'hover:bg-gray-200',
  phoneSelect = '',
  placeholder = 'Выберите опции',
  label,
  error = false,
  errorBorder = false,
  hideArrow = false,
  getIcon,
  isSearchable = false,
  requiredStar = false,
  message = 'Ошибка: Выберите корректные значения.',
}: SelectMultipleProps<T>) => {
  const selectMultipleRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<SelectOption<T>[]>(options);
  const [dropdownDirection, setDropdownDirection] = useState<'down' | 'up'>('down');

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
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options, isSearchable]);

  const handleClickOutside = (event: MouseEvent) => {
    if (selectMultipleRef.current && !selectMultipleRef.current.contains(event.target as Node)) {
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

  const handleOptionClick = (option: SelectOption<T>) => {
    const isAlreadySelected = value.some((selected) => selected.value === option.value);
    if (isAlreadySelected) {
      onChange(value.filter((selected) => selected.value !== option.value));
    } else {
      onChange([...value, option]);
    }
    setOpen(false);
    setSearchTerm('');
  };

  const renderIcon = (option: SelectOption<T>) => {
    if (!getIcon) return null;
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
      } else {
        setDropdownDirection('down');
      }
    }
  };

  useEffect(() => {
    if (open) {
      determineDropdownDirection();
      window.addEventListener('resize', determineDropdownDirection);
    } else {
      window.removeEventListener('resize', determineDropdownDirection);
    }

    return () => {
      window.removeEventListener('resize', determineDropdownDirection);
    };
  }, [open]);

  const removeSelected = (option: SelectOption<T>) => {
    onChange(value.filter((selected) => selected.value !== option.value));
  };

  const renderSelectedTags = () => {
    if (value.length > 0) {
      return (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((val) => (
            <div
              key={val.value}
              className="flex items-center bg-transparent border border-gray-500 text-black px-4 py-2 rounded-full"
            >
              {val.label}
              <button
                type="button"
                className="ml-2 text-5 text-red-500 hover:text-red-700 focus:outline-none"
                onClick={() => removeSelected(val)}
                aria-label={`Удалить ${val.label}`}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderPlaceholder = () => {
    return <span className="text-gray-500">{placeholder}</span>;
  };

  return (
    <div
      className={`relative inline-block text-left w-full ${className} ${
        errorBorder ? 'border-2 border-red-400' : 'border-none'
      }`}
      ref={selectMultipleRef}
    >
      {label && (
        <div className={`${classNameLabel}`}>
          {label} {requiredStar && <span className="text-red-500">*</span>}
        </div>
      )}
      {renderSelectedTags()}
      <button
        type="button"
        disabled={disabled}
        className={`w-full bg-white px-3 py-2 flex justify-between items-center focus:bg-[var(--date-secondary-focus)] 
        ${phoneSelect} 
        ${classNameBorderRadius} 
        ${
          disabled
            ? 'opacity-70 cursor-not-allowed'
            : error
              ? 'border-red-500 text-red-500'
              : 'border-gray-300 text-black'
        }`}
        onClick={toggleOpen}
      >
        <span className={`truncate text-center cursor-pointer ${classNamePlaceholder}`}>
          {renderPlaceholder()}
        </span>
        {!hideArrow && <ArrowIcon open={open} />}
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className={`absolute bg-white rounded-3xl shadow-lg flex flex-col z-50 w-full max-h-60 overflow-y-auto ${classNameTagUl} ${
            dropdownDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          {isSearchable && (
            <div className="px-4 py-2 bg-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <ul className="flex-1 overflow-y-auto">
            {filteredOptions.map((option) => {
              const isSelected = value.some((selected) => selected.value === option.value);
              return (
                <li
                  key={option.value.toString()}
                  className={`px-4 py-3 w-full hover:bg-gray-100 cursor-pointer flex items-center gap-4 ${classNameTagLi} ${
                    isSelected ? 'bg-gray-100 font-semibold' : ''
                  }`}
                  onClick={() => handleOptionClick(option)}
                >
                  {renderIcon(option)}
                  <span className="flex w-full text-left text-black truncate">{option.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {error && <div className="text-red-500 text-sm mt-1">{message}</div>}
    </div>
  );
};
