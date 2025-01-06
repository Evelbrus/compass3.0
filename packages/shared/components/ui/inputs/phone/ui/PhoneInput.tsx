'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SelectSingle, TextInput } from '@shared/components/ui/inputs';
import { countryData } from '@shared/components/ui/inputs/phone/data/PhoneData';
import { countryOptions, formatByCountry } from '@shared/components/ui/inputs/phone';
import { PhoneInputProps } from '@shared/components/ui/inputs/phone';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';
import { SelectOption } from '@shared/lib/effector';
import { cn } from '@shared/lib';

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  label,
  required = false,
  error = false,
  disabled = false,
  readOnly = false,
  classNameWidthPhone = '',
  classNameLabel = 'block text-4 font-medium text-gray-500 mb-2',
  requiredStar = false,
  message = 'Ошибка: Выберите корректное значение.',
}) => {
  const initialCountry = useMemo(() => {
    return countryData.find((country) => value.startsWith(country.dialCode)) || countryData[0];
  }, []);

  const [selectedCountry, setSelectedCountry] = useState(initialCountry);
  const [localNumber, setLocalNumber] = useState<string>(
    value.startsWith(initialCountry.dialCode) ? value.replace(initialCountry.dialCode, '') : '',
  );

  useEffect(() => {
    if (value && value.trim() !== '') {
      const country = countryData.find((c) => value.startsWith(c.dialCode)) || selectedCountry;
      const local = value.startsWith(country.dialCode) ? value.replace(country.dialCode, '') : '';
      setSelectedCountry(country);
      setLocalNumber(local);
    }
  }, [value, selectedCountry]);

  const handleCountryChange = (option: SelectOption<string> | null) => {
    if (!option) return;

    const newCountry = countryData.find((c) => c.code === option.value) || selectedCountry;
    setSelectedCountry(newCountry);
    setLocalNumber('');
    onChange(newCountry.dialCode);
  };

  const handleNumberChange = (val: string) => {
    const inputNumber = val.replace(/\D/g, '');
    const limitedNumber = inputNumber.slice(0, selectedCountry.maxLength);
    setLocalNumber(limitedNumber);
    if (limitedNumber) {
      onChange(selectedCountry.dialCode + limitedNumber);
    } else {
      onChange('');
    }
  };

  const formattedValue = useMemo(() => {
    return formatByCountry(selectedCountry.code, selectedCountry.dialCode, localNumber);
  }, [selectedCountry, localNumber]);

  const filteredCountryOptions = useMemo(() => {
    return countryOptions.map((option) => ({
      ...option,
      label: option.compactLabel,
    }));
  }, []);

  const inputId = `input-${label ? label.replace(/\s+/g, '-').toLowerCase() : 'text-input'}`;

  return (
    <div className="relative flex flex-col">
      {label && (
        <label className={cn(classNameLabel)} htmlFor={inputId}>
          {label} {requiredStar && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-center space-x-2">
        <div className={`w-1/6 min-w-[120px] max-w-[120px] ${classNameWidthPhone}`}>
          <SelectSingle
            options={filteredCountryOptions}
            label=""
            value={{
              value: selectedCountry.code,
              label: (
                <div className="flex items-center flex-shrink-0">
                  <LazyImage
                    src={selectedCountry.flag}
                    alt={selectedCountry.name}
                    className="w-[24px] h-[24px] mr-1 object-cover"
                    placeholder={<Skeleton width={24} height={24} />}
                  />
                  <span>{selectedCountry.dialCode}</span>
                </div>
              ),
            }}
            classNameTagUl="min-w-[250px] max-w-[250px] top-14 text-start border-2 border-gray-500"
            onChange={handleCountryChange}
            disabled={disabled}
            readOnly={readOnly} // Добавлено readOnly
          />
        </div>

        <div className="w-full">
          <TextInput
            type="text"
            value={formattedValue}
            onChange={handleNumberChange}
            placeholder="Введите номер телефона"
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            errorBorder={error}
            message={message}
            error={error}
          />
        </div>
      </div>
    </div>
  );
};

PhoneInput.displayName = 'PhoneInput';
