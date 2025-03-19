'use client';

import React, { useRef, useState, ChangeEvent, useCallback } from 'react';
import { ArrowIcon } from '@shared/components/ui/icon';
import Spinner from '@shared/components/ui/icon/Spinner';
import { cn } from '@shared/lib';

import { SelectOption } from '@shared/lib/effector/types/types';

export interface SelectSingleProps<T extends string | number> {
  options: SelectOption<T>[];
  value: SelectOption<T> | null;
  onChange: (option: SelectOption<T> | null) => void;
  onFocus?: () => void;

  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  placeholder?: string;
  label?: string;
  required?: boolean; // Добавлен пропс required
  error?: boolean;
  requiredStar?: boolean;
  isLoading?: boolean;
  message?: string;
  isSearchable?: boolean;
  searchPlaceholder?: string;
  onInputChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  classNameLabel?: string;
  widthOpen?: string;
}

export const SelectSingle = <T extends string | number>({
  options,
  value,
  onChange,
  onFocus,
  disabled = false,
  readOnly = false,
  className = '',
  placeholder = 'Выберите опцию',
  label,
  required = false, // Добавлено значение по умолчанию
  error = false,
  requiredStar = false,
  isLoading = false,
  message = 'Ошибка: Выберите корректное значение.',
  isSearchable = false,
  searchPlaceholder = 'Поиск...',
  onInputChange,
  classNameLabel = 'text-start mr-3 mb-2 opacity-100 flex ml-[10px] text-sm text-gray-500 font-bold',
  widthOpen = 'w-full',
}: SelectSingleProps<T>) => {
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Фильтруем опции при изменении поискового запроса
  const filteredOptions =
    isSearchable && searchTerm
      ? options.filter((option) => {
          const lower = searchTerm.toLowerCase();
          if (typeof option.label === 'string') {
            return option.label.toLowerCase().includes(lower);
          }
          if (option.searchText) {
            return option.searchText.toLowerCase().includes(lower);
          }
          return false;
        })
      : options;

  // Обработчик клика вне селекта
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setOpen(false);
      setSearchTerm('');
    }
  }, []);

  // Переключение состояния открытия/закрытия
  const toggleOpen = useCallback(() => {
    if (!disabled && !isLoading && !readOnly) {
      const newOpenState = !open;

      // Вызываем onFocus при открытии
      if (newOpenState && onFocus) {
        onFocus();
      }

      // Если открываем, добавляем обработчик клика вне области
      if (newOpenState) {
        document.addEventListener('mousedown', handleClickOutside);
        // Фокус на поле поиска при открытии, если поиск включен
        setTimeout(() => {
          if (isSearchable && searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 10);
      } else {
        // Если закрываем, удаляем обработчик и очищаем поиск
        document.removeEventListener('mousedown', handleClickOutside);
        setSearchTerm('');
      }

      setOpen(newOpenState);
    }
  }, [disabled, isLoading, readOnly, open, handleClickOutside, onFocus, isSearchable]);

  // Удаляем обработчик при размонтировании компонента
  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Обработка выбора опции
  const handleOptionClick = (option: SelectOption<T>) => {
    if (value?.value !== option.value) {
      onChange(option);
    } else {
      onChange(null);
    }
    setOpen(false);
    setSearchTerm('');
    document.removeEventListener('mousedown', handleClickOutside);
  };

  // Обработка изменения поля поиска
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onInputChange) {
      onInputChange(e);
    }
  };

  // Классы для кнопки
  const buttonClass = cn(
    'w-full min-w-0 appearance-none relative',
    'h-11 max-h-11',
    'px-5 py-[10px]',
    'rounded-2xl',
    'text-sm font-medium',
    'bg-transparent',
    'outline-none',
    'border border-solid',
    error
      ? 'border-red-500 text-red-900'
      : 'border-gray-200 text-gray-900 hover:border-blue-500 focus:border-blue-500',
    disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed',
    'flex justify-between items-center',
  );

  // Классы для инпута поиска
  const searchInputClass = cn(
    'w-full px-4 py-2 text-sm',
    'border border-gray-200 rounded-md',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
  );

  // Класс для опции списка
  const optionClass = (isSelected: boolean) =>
    cn(
      'px-4 py-2 cursor-pointer text-sm',
      'hover:bg-gray-100 transition-colors duration-150',
      isSelected ? 'bg-blue-50 font-medium' : '',
    );

  return (
    <div className={cn('relative', className)} ref={selectRef}>
      {label && (
        <label className={cn(classNameLabel)}>
          {label}
          {(required || requiredStar) && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        disabled={disabled || isLoading || readOnly}
        className={buttonClass}
        onClick={toggleOpen}
        onFocus={() => onFocus && onFocus()}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {isLoading ? (
          <Spinner size="small" />
        ) : (
          <span className={cn(value ? '' : 'text-gray-400', 'truncate')}>
            {value?.label || placeholder}
          </span>
        )}
        <div className={'p-3 bg-gray-100 rounded-full shadow-2xl'}>
          {!isLoading && <ArrowIcon open={open} />}
        </div>
      </button>

      {/* Блок для сообщения об ошибке с фиксированной высотой */}
      <div className="flex justify-end items-center h-5 mt-1 mx-3">
        {error && message && <p className="text-red-500 text-xs">{message}</p>}
      </div>

      {/* Выпадающий список */}
      {open && (
        <div
          className={cn(
            'fixed z-[1000]', // Изменено с 'absolute' на 'fixed'
            'bg-white rounded-md border border-gray-200 shadow-lg',
            widthOpen,
          )}
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            // Расчет позиции выпадающего меню относительно текущего положения селектора
            top: selectRef.current
              ? window.scrollY + selectRef.current.getBoundingClientRect().bottom + 5
              : 0,
            left: selectRef.current
              ? window.scrollX + selectRef.current.getBoundingClientRect().left
              : 0,
            width: selectRef.current ? selectRef.current.offsetWidth : 'auto',
          }}
          role="listbox"
        >
          {/* Поле поиска (если включено) */}
          {isSearchable && (
            <div className="sticky top-0 p-2 bg-white border-b border-gray-100">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  className={searchInputClass}
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchTerm('')}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Список опций */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              <ul>
                {filteredOptions.map((option) => (
                  <li
                    key={String(option.value)}
                    className={optionClass(value?.value === option.value)}
                    onClick={() => handleOptionClick(option)}
                    role="option"
                    aria-selected={value?.value === option.value}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchTerm ? 'Ничего не найдено' : 'Нет доступных опций'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

SelectSingle.displayName = 'SelectSingle';
