import React from 'react';
import styles from './CheckboxInput.module.css';

interface CheckboxInputProps {
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  requiredStar?: boolean;
  error?: boolean;
  message?: string;
  className?: string;
  position?: 'left' | 'right';
  disabled?: boolean;
}

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
  disabled = false,
}) => (
  <label
    className={`${styles.checkboxInput} ${className} ${
      error ? styles.checkboxError : ''
    } ${position === 'right' ? styles.checkboxRight : ''} ${
      disabled ? styles.checkboxDisabled : ''
    }`}
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
      disabled={disabled}
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
