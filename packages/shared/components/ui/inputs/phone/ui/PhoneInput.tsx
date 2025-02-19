'use client';

import React, { useMemo, useState, useEffect, JSX } from 'react';
import { TextInput } from '@shared/components/ui/inputs';
import { SelectSingle } from '@shared/components/ui/inputs';
import { cn } from '@shared/lib';
import { countryData } from '@shared/components/ui/inputs/phone/data/PhoneData';
import { countryOptions } from '@shared/components/ui/inputs/phone';
import { formatByCountry } from '@shared/components/ui/inputs/phone';
import { PhoneInputProps } from '@shared/components/ui/inputs/phone';
import { OptionBase, SelectOption } from '@shared/lib/effector/types/types';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';

export interface CountryOption extends OptionBase<string> {
  compactLabel: JSX.Element;
}

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  maxLength: number;
  minLength: number;
  formatPattern: number[];
}

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
  //Исходная страна — по входному value (если +7 => Россия, +996 => Киргизия)
  const initialCountry: Country = useMemo(() => {
    return countryData.find((country) => value?.startsWith(country.dialCode)) || countryData[0]!;
  }, [value]);

  const [selectedCountry, setSelectedCountry] = useState<Country>(initialCountry);
  const [localNumber, setLocalNumber] = useState<string>(
    value?.startsWith(initialCountry.dialCode) ? value.replace(initialCountry.dialCode, '') : '',
  );

  useEffect(() => {
    if (value && value.trim() !== '') {
      const c = countryData.find((x) => value.startsWith(x.dialCode)) || initialCountry;
      const local = value.startsWith(c.dialCode) ? value.replace(c.dialCode, '') : '';
      setSelectedCountry(c);
      setLocalNumber(local);
    }
  }, [value, initialCountry]);

  const handleCountryChange = (option: SelectOption<string> | null) => {
    if (!option) return;
    const newCountry = countryData.find((c) => c.code === option.value) || initialCountry;
    setSelectedCountry(newCountry);
    setLocalNumber('');
    onChange(newCountry.dialCode);
  };

  //Изменили сигнатуру, добавив | bigint | null, и обработали случай, когда значение null
  const handleNumberChange = (val: string | number | bigint | null) => {
    if (val === null) {
      setLocalNumber('');
      onChange('');
      return;
    }

    const inputNumber = String(val).replace(/\D/g, '');
    const limitedNumber = inputNumber.slice(0, selectedCountry.maxLength);
    setLocalNumber(limitedNumber);
    if (limitedNumber) {
      onChange(selectedCountry.dialCode + limitedNumber);
    } else {
      onChange('');
    }
  };

  const formattedValue = useMemo(() => {
    return formatByCountry(selectedCountry.code, localNumber);
  }, [selectedCountry, localNumber]);

  const filteredCountryOptions = useMemo<CountryOption[]>(() => {
    return countryOptions.map((opt) => ({
      ...opt,
      label: opt.compactLabel,
    }));
  }, []);

  const inputId = `input-${label ? label.replace(/\s+/g, '-').toLowerCase() : 'text-input'}`;

  return (
    <div className="relative flex flex-col">
      {label && (
        <label className={cn(classNameLabel)} htmlFor={inputId}>
          {label}
          {requiredStar && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex items-start space-x-2">
        <div className={cn('w-1/6 min-w-[120px] max-w-[120px]', classNameWidthPhone)}>
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
            onChange={handleCountryChange}
            disabled={disabled}
            readOnly={readOnly}
            widthOpen={'w-[300px]'}
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
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

PhoneInput.displayName = 'PhoneInput';
