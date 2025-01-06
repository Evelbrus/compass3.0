import React from 'react';
import styles from './CheckboxInput.module.css';
import { CheckboxInputProps } from '@shared/components/ui/inputs/chekbox';

export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label,
  checked,
  onChange,
  required = false,
  requiredStar = false,
  error = false,
  message = 'Ошибка: Выберите корректное значение.',
  className = '',
  position = 'left',
}) => (
  <label
    className={`${styles.checkboxInput} ${className} ${
      error ? styles.checkboxError : ''
    } ${position === 'right' ? styles.checkboxRight : ''}`}
  >
    {position === 'right' && (
      <div className={styles.checkboxContent}>
        <p>
          {label} {requiredStar && <span className="text-red-500">*</span>}
        </p>
      </div>
    )}
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      required={required}
      className={styles.checkboxHidden}
    />
    <div className={styles.customCheckbox}>
      {checked && <span className={styles.checkboxTick}></span>}
    </div>
    {position === 'left' && (
      <div className={styles.checkboxContent}>
        <p>
          {label} {requiredStar && <span className="text-red-500">*</span>}
        </p>
      </div>
    )}
    {error && <div className="text-red-500 text-sm">{message}</div>}{' '}
  </label>
);

CheckboxInput.displayName = 'CheckboxInput';
