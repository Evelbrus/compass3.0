'use client';

import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import { ArrowIcon } from '@shared/components/ui/icon';
import Spinner from '@shared/components/ui/icon/Spinner';
import { cn } from '@shared/lib';

import { SelectOption } from '@shared/lib/effector/types/types';

export interface SelectSingleProps<T extends string | number> {
  options: SelectOption<T>[];
  value: SelectOption<T> | null;
  onChange: (option: SelectOption<T> | null) => void;

  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  label?: string;
  error?: boolean;
  requiredStar?: boolean;
  isLoading?: boolean;
  message?: string;
  isSearchable?: boolean;
  onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  classNameLabel?: string;
  //ширина всплывающего списка
  widthOpen?: string;
}

export const SelectSingle = <T extends string | number>({
  options,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  className = '',
  placeholder = 'Выберите опцию',
  label,
  error = false,
  requiredStar = false,
  isLoading = false,
  message = 'Ошибка: Выберите корректное значение.',
  isSearchable = false,
  onInputChange,
  classNameLabel = 'block text-4 font-medium text-gray-500 mb-2',
  widthOpen = 'w-full',
}: SelectSingleProps<T>) => {
  const selectRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<SelectOption<T>[]>(options);

  //Фильтрация (если нужна)
  useEffect(() => {
    if (isSearchable) {
      const lower = searchTerm.toLowerCase();

      setFilteredOptions(
        options.filter((option) => {
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
        }),
      );
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options, isSearchable]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
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
  const handleOptionClick = (option: SelectOption<T>) => {
    //Кликнули по другой опции
    if (value?.value !== option.value) {
      onChange(option);
    } else {
      //Нажали на ту же — сбрасываем в null
      onChange(null);
    }
    setOpen(false);
    setSearchTerm('');
  };

  //Классы кнопки
  const buttonClass = cn(
    'w-full rounded p-2 focus:outline-none focus:ring flex justify-between items-center',
    error ? 'border-2 border-red-400' : 'border border-gray-300 focus:border-blue-300',
  );

  return (
    <div className={cn('relative', className)} ref={selectRef}>
      {label && (
        <label className={cn(classNameLabel)}>
          {label}
          {requiredStar && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled || isLoading || readOnly}
        className={buttonClass}
        onClick={toggleOpen}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {/*Если идёт загрузка, показываем спиннер, иначе отображаем label или placeholder */}
        {isLoading ? (
          <Spinner size="small" />
        ) : (
          <span className={cn(value ? '' : 'text-gray-400', 'truncate')}>
            {value?.label || placeholder}
          </span>
        )}
        {!isLoading && <ArrowIcon open={open} />}
      </button>

      {open && (
        <div
          className={cn(
            'absolute bg-white rounded-md z-50 max-h-60 overflow-auto mt-2 border border-gray-300',
            widthOpen,
          )}
          role="listbox"
        >
          {isSearchable && (
            <div className="px-3 py-2 bg-gray-200">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  onInputChange?.(e);
                }}
                placeholder="Поиск..."
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Поиск опций"
              />
            </div>
          )}

          <ul>
            {filteredOptions.map((option) => (
              <li
                key={String(option.value)}
                className={cn(
                  'px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2',
                  value?.value === option.value ? 'bg-gray-100 font-semibold' : '',
                )}
                onClick={() => handleOptionClick(option)}
                role="option"
                aria-selected={value?.value === option.value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{message}</p>}
    </div>
  );
};

SelectSingle.displayName = 'SelectSingle';
