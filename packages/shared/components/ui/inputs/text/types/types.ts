import React from 'react';

export interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string | number;
  onChange: (value: string | number) => void;
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
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
  classNameBg?: string;
  classNameLabel?: string;
  classNamePlaceholder?: string;
  classNameBorderRadius?: string;
  classNamePadding?: string;
  gap?: string;
  icon?: React.ReactNode;
  minDate?: Date;
  message?: string;
}
