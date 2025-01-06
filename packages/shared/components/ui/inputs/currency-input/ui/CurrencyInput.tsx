import React, { JSX, useState } from 'react';
import { Select, TextInput } from '@shared/components/ui/inputs';
import {
  availableCurrencies,
  CurrencyInputProps,
  CurrencyOption,
  handleCurrencyChange,
} from '@shared/components/ui/inputs/currency-input';

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  label,
  required = false,
  disabled = false,
  error = false,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyOption>(availableCurrencies[0]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center">
        <div className="flex-1">
          <TextInput
            label={label}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            error={error}
            type="number"
          />
        </div>
        <div className="ml-2">
          <Select
            options={availableCurrencies.map((currency) => ({
              value: currency.code,
              label: currency.name || currency.code, // Генерация label
            }))}
            label=""
            value={{
              value: selectedCurrency.code,
              label: selectedCurrency.name || selectedCurrency.code, // Генерация label для текущего значения
            }}
            onChange={(option) => {
              if (option) {
                // Проверка наличия label
                const safeOption = {
                  ...option,
                  label: option.label || option.value, // Подстановка значения по умолчанию
                };

                handleCurrencyChange(
                  safeOption as { value: string; label: string | JSX.Element },
                  availableCurrencies,
                  setSelectedCurrency,
                );
              }
            }}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

CurrencyInput.displayName = 'CurrencyInput';
