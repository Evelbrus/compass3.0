'use client';

import React from 'react';
import { RadioInputProps } from '@shared/components/ui/inputs/radio/types/types';
import styles from './RadioInput.module.css';

export const RadioInput: React.FC<RadioInputProps> = ({
  label,
  checked,
  onChange,
  required,
  requiredStar = false,
  error = false,
  message = 'Ошибка: Выберите корректное значение.',
  position = 'left',
  className,
  name,
}) => (
  <div
    className={`${styles.radioInput} ${className} ${
      position === 'left' ? styles.left : styles.right
    }`}
  >
    <input
      type="radio"
      checked={checked}
      onChange={onChange}
      required={required}
      className={styles.radioHidden}
      name={name}
    />
    <div className={styles.customCheckbox}>
      {/*Галочка отображается только если опция выбрана */}
      {checked && <span className={styles.checkboxTick}></span>}
    </div>
    <div className={styles.radioContent}>
      <p className={`${className}`}>
        {label} {requiredStar && <span className="text-red-500">*</span>}
      </p>
    </div>
    {error && <div className="text-red-500 text-sm">{message}</div>}{' '}
    {/*Добавлено отображение сообщения об ошибке */}
  </div>
);

RadioInput.displayName = 'RadioInput';
