'use client';

import React, { useRef } from 'react';
import { TextInputProps } from '@shared/components/ui/inputs/text/types/types';
import { cn } from '@shared/lib';

export const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  requiredStar = false,
  disabled = false,
  readOnly = false,
  type = 'text',
  error = false,
  errorBorder = false,
  className = '',
  classNameLabel = 'block text-4 font-medium text-gray-500 mb-2',
  classNamePlaceholder = 'focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold',
  classNameBorderRadius = 'rounded-md border border-gray-300',
  gap = '',
  message = 'Ошибка: Выберите корректное значение.',
  minLength,
  maxLength = 30,
  onKeyDown,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const sharedClasses = cn(
    'w-full',
    'bg-white px-3 py-2',
    classNameBorderRadius,
    classNamePlaceholder,
    errorBorder && 'border-red-500',
    error && 'border-red-500',
    disabled ? 'cursor-not-allowed' : readOnly && 'cursor-default',
  );

  return (
    <div className={`relative ${cn(className, gap)}`}>
      {label && (
        <label className={cn(classNameLabel)}>
          {label} {requiredStar && <span className="text-red-500">*</span>}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          className={sharedClasses}
          minLength={minLength}
          maxLength={maxLength}
          onKeyDown={onKeyDown}
          aria-invalid={error}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          className={sharedClasses}
          minLength={minLength}
          maxLength={maxLength}
          onKeyDown={onKeyDown}
          aria-invalid={error}
        />
      )}
      {error && (
        <div className="absolute w-full flex justify-end text-red-500 text-sm">{message}</div>
      )}
    </div>
  );
};

TextInput.displayName = 'TextInput';
