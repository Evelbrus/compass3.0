import React from 'react';

export function formatDateToLocal(value: string) {
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toLocaleDateString('ru').split('.').join('/');
  }
  return '';
}

export function formatDateToISO(value: string) {
  const parts = value.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts.map((part) => parseInt(part, 10));
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month - 1, day).toISOString();
    }
  }
  return null;
}

export function handleInputChange(
  e: React.ChangeEvent<HTMLInputElement>,
  onChange: (isoDate: string) => void,
  setLocalValue: (value: string) => void,
) {
  const inputValue = e.target.value;
  const isoDate = formatDateToISO(inputValue);
  if (isoDate) {
    onChange(isoDate);
  }
  setLocalValue(inputValue);
}
