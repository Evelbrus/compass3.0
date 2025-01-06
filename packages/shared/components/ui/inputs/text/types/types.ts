import React from 'react';

export interface TextInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  requiredStar?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  type?: React.HTMLInputTypeAttribute | 'textarea';
  error?: boolean;
  errorBorder?: boolean;
  minLength?: number;
  maxLength?: number;
  validationMessage?: string;
  loading?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className?: string;
  classNameLabel?: string;
  classNamePlaceholder?: string;
  classNameBorderRadius?: string;
  gap?: string;
  icon?: React.ReactNode;
  minDate?: Date;
  message?: string;
}
