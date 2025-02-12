//components/SelectSingle.tsx (No changes)
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowIcon } from '@shared/components/ui/icon';
import { SelectSingleProps } from '@shared/components/ui/inputs/select/types/SelectTypes';
import { SelectOption } from '@shared/lib/effector';
import Spinner from '@shared/components/ui/icon/Spinner';
import { cn } from '@shared/lib';

export const SelectSingle = <T extends string | number>({
  options,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  className = '',
  classNameBg = 'bg-white',
  classNamePadding = 'px-3 py-[9px]',
  classNameLabel = 'block text-4 font-medium text-[#2A3037] mb-2',
  classNamePlaceholder = 'text-4 text-[#2A3037] font-extrabold',
  classNameBorderRadius = 'rounded-md border border-gray-300',
  classNameTagUl = 'bg-gray-50 border-2 border-gray-200',
  classNameTagLi = 'hover:bg-gray-200',
  phoneSelect = '',
  placeholder = 'Выберите опцию',
  label,
  error = false,
  errorBorder = false,
  hideArrow = false,
  getIcon,
  isSearchable = false,
  requiredStar = false,
  isLoading = false,
  message = 'Ошибка: Выберите корректное значение.',
  onInputChange,
}: SelectSingleProps<T>) => {
  const selectSingleRef = useRef<HTMLDivElement>(null);
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
    if (selectSingleRef.current && !selectSingleRef.current.contains(event.target as Node)) {
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
    if (!disabled && !isLoading && !readOnly) {
      setOpen((prev) => !prev);
    }
  };

  const handleOptionClick = (option: SelectOption<T>) => {
    if (value?.value !== option.value) {
      onChange(option);
    } else {
      onChange(null);
    }
    setOpen(false);
    setSearchTerm('');
  };

  const renderIcon = (option: SelectOption<T>) => {
    if (!getIcon) return null;
    return getIcon(option.value);
  };

  const determineDropdownDirection = () => {
    const selectRect = selectSingleRef.current?.getBoundingClientRect();
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

  return (
    <div
      className={`relative ${cn(className)} ${
        errorBorder ? 'border-2 border-red-400' : 'border-none'
      }`}
      ref={selectSingleRef}
    >
      {label && (
        <label className={cn(classNameLabel)}>
          {label}
          {requiredStar && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <button
        type="button"
        disabled={disabled || isLoading}
        className={`w-full flex justify-between items-center
        ${classNamePadding}
        ${classNameBg}
        ${phoneSelect} 
        ${classNameBorderRadius} 
        ${
          disabled || isLoading
            ? 'opacity-70 cursor-not-allowed'
            : readOnly
              ? 'cursor-default'
              : error
                ? 'border-red-500 text-red-500'
                : 'border-gray-300 text-black'
        }`}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {isLoading ? (
          <Spinner size="small" />
        ) : (
          <span
            className={`truncate text-center ${classNamePlaceholder} ${value ? '' : 'text-gray-400'}`}
          >
            {value ? value.label : placeholder}
          </span>
        )}
        {!hideArrow && !isLoading && <ArrowIcon open={open} />}
      </button>
      {open && (
        <div
          ref={dropdownRef}
          className={`absolute bg-white rounded-3xl flex flex-col z-50 w-full max-h-60 overflow-hidden ${classNameTagUl} ${
            dropdownDirection === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
          role="listbox"
        >
          {isSearchable && (
            <div className="px-4 py-2 bg-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (onInputChange) {
                    onInputChange(e);
                  }
                }}
                placeholder="Поиск..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Поиск опций"
              />
            </div>
          )}
          <ul className="flex-1 overflow-y-auto">
            {filteredOptions.map((option) => (
              <li
                key={option.value.toString()}
                className={`px-4 py-3 w-full hover:bg-gray-100 cursor-pointer flex items-center gap-4 ${classNameTagLi} ${
                  value?.value === option.value ? 'bg-gray-100 font-semibold' : ''
                }`}
                onClick={() => handleOptionClick(option)}
                role="option"
                aria-selected={value?.value === option.value}
              >
                {renderIcon(option)}
                <span className="flex w-full text-left text-black truncate">{option.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <div className="text-red-500 text-sm mt-1">{message}</div>}
    </div>
  );
};

SelectSingle.displayName = 'SelectSingle';
