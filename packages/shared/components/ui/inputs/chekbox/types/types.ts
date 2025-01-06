import React from 'react';
import { FieldError } from 'react-hook-form';

export interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: FieldError;
  tabIndex?: number;
}

export interface CheckboxInputProps {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: FieldError | boolean;
  className?: string;
  position?: 'left' | 'right';
  requiredStar?: boolean;
  message?: string;
}
