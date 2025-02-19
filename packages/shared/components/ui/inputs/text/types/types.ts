import React from 'react';

export interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string | number | bigint | null;
  onChange: (value: string | number | null) => void;
  required?: boolean;
  requiredStar?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  type?: React.HTMLInputTypeAttribute | 'textarea' | 'number';
  error?: boolean;
  errorBorder?: boolean;
  minLength?: number;
  maxLength?: number;
  validationMessage?: string;
  loading?: boolean;
  rows?: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
  classNameBg?: string;
  classNameLabel?: string;
  classNamePlaceholder?: string;
  classNameBorderRadius?: string;
  classNamePadding?: string;
  inputClass?: string;
  gap?: string;
  icon?: React.ReactNode;
  minDate?: Date;
  message?: string;
  ref?: React.Ref<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>;
  step?: string | number;
}
