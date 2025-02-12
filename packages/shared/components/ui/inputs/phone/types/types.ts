//../../packages/shared/components/ui/inputs/phone/index.ts (Keep onChange as string | number)
import React from 'react';

export interface PhoneInputProps {
  value: string;
  onChange: (value: string | number) => void;
  label?: string;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  classNameWidthPhone?: string;
  classNameLabel?: string;
  requiredStar?: boolean;
  message?: string;
}

export interface PhoneOption<T> {
  value: T;
  label: React.ReactNode;
}
