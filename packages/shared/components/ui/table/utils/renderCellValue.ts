import React from 'react';

export const renderCellValue = (value: unknown): React.ReactNode => {
  if (React.isValidElement(value)) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value === null || value === undefined) {
    return null;
  }
  // Добавьте дополнительные проверки по необходимости
  return JSON.stringify(value);
};
