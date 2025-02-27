  // TextInput.tsx
  'use client';

  import React, { useRef, useState } from 'react';
  import { cn } from '@shared/lib';

  const formatDateForInput = (value: unknown): string => {
    if (!value) return '';
    if (typeof value === 'string') return value.split('T')[0] ?? '';
    if (value instanceof Date) return value.toISOString().split('T')[0] || '';
    return '';
  };

  const formatDateForBackend = (value: string): string => {
    return new Date(value).toISOString();
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
      'w-full rounded p-3 focus:outline-none focus:ring',
      error ? 'border-2 border-red-400' : 'border border-gray-300 focus:border-blue-300',
    ),
    step,
  }) => {
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const [showPassword, setShowPassword] = useState(false);

    const getFormattedValue = (): string => {
      if (value == null) return '';
      if (type === 'date') return formatDateForInput(value);
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
        newValue = formatDateForBackend(e.target.value);
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
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="relative px-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.282.238-2.5.675-3.625M9.88 9.88A3 3 0 1114.12 14.12M17.325 6.675A9.969 9.969 0 0121 10c0 5.523-4.477 10-10 10a9.969 9.969 0 01-3.325-.675"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
        {error && message && <p className="text-red-500 text-sm mt-1">{message}</p>}
      </div>
    );
  };

  TextInput.displayName = 'TextInput';
