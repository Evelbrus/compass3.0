'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@shared/lib';

type Mode = 'DynamicDate' | 'createAutoDate';

// Форматирование даты для поля ввода
const formatDateForInput = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value.split('T')[0] ?? '';
  if (value instanceof Date) return value.toISOString().split('T')[0] || '';
  return '';
};

// Форматирование даты для отправки на сервер
const formatDateForBackend = (value: string): string => {
  return new Date(value).toISOString();
};

// Форматирование года для поля ввода
const formatYearForInput = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value.split('-')[0] ?? '';
  if (value instanceof Date) return value.getFullYear().toString();
  return '';
};

// Форматирование года для отправки на сервер
const formatYearForBackend = (value: string): string => {
  const year = value.trim();
  if (!year) return '';
  const date = new Date(`${year}-01-01T00:00:00.000Z`);
  return date.toISOString();
};

export interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string | number | bigint | null;
  onChange: (value: string | number | null) => void;
  onFocus?: () => void;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  type?: React.HTMLInputTypeAttribute | 'textarea' | 'number';
  error?: boolean;
  message?: string;
  minLength?: number;
  maxLength?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  classNameLabel?: string;
  inputClass?: string;
  step?: string | number;
  mode?: Mode;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onFocus,
  required = false,
  disabled = false,
  readOnly = false,
  type = 'text',
  error = false,
  message = '',
  minLength,
  maxLength,
  onKeyDown,
  classNameLabel = 'text-start mr-3 mb-2 opacity-100 flex ml-[10px] text-sm text-gray-500 font-bold',
  inputClass,
  step,
  mode = 'DynamicDate',
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [showPassword, _setShowPassword] = useState(false);

  const getFormattedValue = (): string => {
    if (value == null) return '';
    if (type === 'date') {
      return mode === 'DynamicDate' ? formatDateForInput(value) : formatYearForInput(value);
    }
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'string') return value;
    return String(value);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number | null = e.target.value;

    if (type === 'number') {
      newValue = e.target.value === '' ? '' : parseFloat(e.target.value);
      if (isNaN(newValue as number)) newValue = '';
    } else if (type === 'date') {
      newValue =
        mode === 'DynamicDate'
          ? formatDateForBackend(e.target.value)
          : formatYearForBackend(e.target.value);
    }

    onChange(newValue);
  };

  const handleFocus = () => {
    if (onFocus) {
      onFocus();
    }
  };

  const inputClassName = cn(
    'w-full min-w-0 appearance-none relative',
    'h-11 max-h-11',
    'px-5 py-[10px]',
    'rounded-2xl',
    'text-sm font-medium',
    'bg-transparent',
    'outline-none',
    'border border-solid',
    readOnly
      ? 'border-gray-200 text-gray-900 cursor-default' // Для readOnly: убираем hover и добавляем cursor-default
      : error
        ? 'border-red-500 text-red-900'
        : 'border-gray-200 text-gray-900 hover:border-blue-500 focus:border-blue-500', // Для редактирования: hover и focus
    disabled && 'bg-gray-50 text-gray-400 cursor-not-allowed',
    'mr-[30px]',
    inputClass,
  );

  return (
    <div className="w-full relative">
      {label && (
        <label className={cn(classNameLabel)} htmlFor={inputRef.current?.id}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          value={getFormattedValue()}
          onChange={handleChange}
          onFocus={handleFocus}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          onKeyDown={onKeyDown}
          aria-invalid={error}
          step={type === 'number' ? (step ? String(step) : 'any') : undefined}
          className={inputClassName}
        />
      </div>

      {/* Сообщение об ошибке отображается только если не readOnly */}
      {!readOnly && (
        <div className="flex justify-end items-center h-5 mt-1 mx-3">
          {error && message && <p className="text-red-500 text-xs">{message}</p>}
        </div>
      )}
    </div>
  );
};

TextInput.displayName = 'TextInput';
