'use client';

import React, { useRef, useState } from 'react';
import { cn } from '@shared/lib';

type Mode = 'DynamicDate' | 'createAutoDate';

const formatDateForInput = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value.split('T')[0] ?? '';
  if (value instanceof Date) return value.toISOString().split('T')[0] || '';
  return '';
};

const formatDateForBackend = (value: string): string => {
  return new Date(value).toISOString();
};

const formatYearForInput = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value.split('-')[0] ?? '';
  if (value instanceof Date) return value.getFullYear().toString();
  return '';
};

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
  required = false,
  disabled = false,
  readOnly = false,
  type = 'text',
  error = false,
  message = '',
  minLength,
  maxLength,
  onKeyDown,
  classNameLabel = 'block text-4 font-medium text-gray-500 mb-2',
  inputClass = cn(
    'w-full rounded p-2 focus:outline-none focus:ring',
    error ? 'border-2 border-red-400' : 'border border-gray-300 focus:border-blue-300',
  ),
  step,
  mode = 'DynamicDate',
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [showPassword, setShowPassword] = useState(false);

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

  return (
    <div className="w-full relative">
      {label && (
        <label className={cn(classNameLabel)}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className={cn('flex flex-row justify-between', inputClass)}>
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          value={getFormattedValue()}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          onKeyDown={onKeyDown}
          aria-invalid={error}
          step={type === 'number' ? (step ? String(step) : 'any') : undefined}
          className="w-full"
        />
      </div>
      {error && message && <p className="text-red-500 text-sm mt-1">{message}</p>}
    </div>
  );
};

TextInput.displayName = 'TextInput';
