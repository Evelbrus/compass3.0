import React, { useRef } from 'react';
import { cn } from '@shared/lib';

interface NumberInputProps {
  label?: string;
  placeholder?: string;
  value: number | '' | undefined;
  onChange: (value: number | '' | undefined) => void;
  required?: boolean;
  requiredStar?: boolean;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  classNameLabel?: string;
  classNamePlaceholder?: string;
  classNameBorderRadius?: string;
  gap?: string;
  message?: string;
  maxLength?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  required = false,
  requiredStar = false,
  disabled = false,
  error = false,
  className = '',
  classNameLabel = 'block text-4 font-medium text-gray-500 mb-2',
  classNamePlaceholder = 'focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold',
  classNameBorderRadius = 'rounded-md border border-gray-300',
  gap = '',
  message = 'Ошибка: Введите корректное значение.',
  maxLength = 10,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const inputId = `number-input-${label ? label.replace(/\s+/g, '-').toLowerCase() : 'number-input'}`;

  const sharedClasses = cn(
    'w-full',
    'bg-white px-3 py-2',
    classNameBorderRadius,
    classNamePlaceholder,
    error && 'border-red-500',
    disabled && 'bg-gray-100 cursor-not-allowed',
  );

  const handleChange = (val: string) => {
    if (val.length > maxLength) return;
    if (val === '') {
      onChange('');
      return;
    }
    if (/^\d+$/.test(val)) {
      onChange(Number(val));
    }
  };

  return (
    <div className={`relative ${cn(className, gap)}`}>
      {label && (
        <label className={cn(classNameLabel)} htmlFor={inputId}>
          {label} {requiredStar && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        value={value !== undefined && value !== null ? value.toString() : ''}
        onChange={(e) => handleChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={sharedClasses}
        aria-invalid={error}
      />
      {error && <div className="text-red-500 text-sm mt-1">{message}</div>}
    </div>
  );
};

NumberInput.displayName = 'NumberInput';
