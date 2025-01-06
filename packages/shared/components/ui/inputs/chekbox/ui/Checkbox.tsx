'use client';

import React from 'react';
import { CheckboxProps } from '@shared/components/ui/inputs/chekbox';
import styles from './Checkbox.module.css';

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  label,
  checked,
  onChange,
  required,
  disabled,
  loading = false,
  error,
  tabIndex = 0,
}) => {
  return (
    <div className="flex flex-col space-y-1 items-start">
      <div className={`${styles.formGroupCheckbox}`}>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={onChange}
          required={required}
          disabled={disabled || loading}
          className={`${styles.checkboxInput} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          tabIndex={tabIndex}
        />
        <label htmlFor={id} className={`${styles.labelText} text-gray-600 cursor-pointer`}>
          {label}
        </label>
      </div>
    </div>
  );
};

Checkbox.displayName = 'Checkbox';
