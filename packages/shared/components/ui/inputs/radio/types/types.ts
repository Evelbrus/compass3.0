import React from 'react';

export interface RadioInputProps {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  position?: 'left' | 'right';
  className?: string;
  name: string;
  requiredStar?: boolean;
  error?: boolean;
  message?: string;
}
