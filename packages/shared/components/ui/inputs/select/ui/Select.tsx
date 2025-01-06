'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { ExtendedSelectProps, getPassengerLabel } from '@shared/components/ui/inputs/select';
import { ArrowIcon } from '@shared/components/ui/icon';
import { isOptionTariff, SelectOption } from '@shared/lib/effector';

export const Select = <T extends string | number>({
  options,
  value,
  onChange,
  disabled = false,
  className = '',
  classNamePlaceholder = '',
  classNameBorderRadius = '',
  classNameTagUl = '',
  classNameTagLi = '',
  classNameLabel = '',
  phoneSelect = '',
  placeholder = 'Выберите опцию',
  label,
  error = false,
  errorBorder = false,
  hideArrow = false,
  counter = false,
  getIcon,
  isSearchable = false,
}: ExtendedSelectProps<T>) => {
  const selectRef = useRef<HTMLDivElement>(null);

  const initialCounterValues = useMemo(() => {
    const initial: { [key: string]: number } = {};
    options.forEach((option) => {
      if (isOptionTariff(option)) {
        initial[option.value.toString()] = 1;
      }
    });
    return initial;
  }, [options]);

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<SelectOption<T>[]>(options);
  const [counterValues, setCounterValues] = useState<{ [key: string]: number }>(
    initialCounterValues,
  );

  useEffect(() => {
    if (isSearchable) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const filtered = options.filter((option) => {
        if (typeof option.label === 'string') {
          return option.label.toLowerCase().includes(lowerSearchTerm);
        }
        return false;
      });
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options, isSearchable]);

  const handleClickOutside = (event: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
      setOpen(false);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleOpen = () => {
    if (!disabled) {
      setOpen((prev) => !prev);
    }
  };

  const incrementCounter = (key: string, maxPeople: number) =>
    setCounterValues((prev) => ({
      ...prev,
      [key]: Math.min(prev[key] + 1, maxPeople),
    }));

  const decrementCounter = (key: string) =>
    setCounterValues((prev) => ({
      ...prev,
      [key]: Math.max(prev[key] - 1, 1),
    }));

  const handleOptionClick = (option: SelectOption<T>) => {
    if (value?.value !== option.value) {
      onChange(option);
    }
    setOpen(false);
    setSearchTerm('');
  };

  const renderIcon = (option: SelectOption<T>) => {
    if (!getIcon) return null;
    return getIcon(option.value);
  };

  return (
    <div
      className={`relative inline-block text-left w-full ${
        errorBorder ? 'border-2 border-red-400' : 'border-none'
      } ${className}`}
      ref={selectRef}
    >
      {label && <div className={`${classNameLabel}`}>{label}</div>}
      <button
        type="button"
        disabled={disabled}
        className={`w-full bg-white px-3 py-2 flex justify-between items-center focus:bg-[var(--date-secondary-focus)] 
        ${phoneSelect} 
        ${classNameBorderRadius} 
        ${
          disabled
            ? 'opacity-70 cursor-not-allowed'
            : error
              ? 'border-red-500 text-red-500'
              : 'border-gray-300 text-black'
        }`}
        onClick={toggleOpen}
      >
        <span
          className={`truncate text-center cursor-pointer ${classNamePlaceholder} ${
            value ? '' : 'text-gray-500'
          }`}
        >
          {value
            ? counter && isOptionTariff(value)
              ? `${getPassengerLabel(counterValues[value.value.toString()])} ${value.label}`
              : value.label
            : placeholder}
        </span>
        {!hideArrow && <ArrowIcon open={open} />}
      </button>
      {open && (
        <div
          className={`absolute bg-white rounded-3xl shadow-lg overflow-auto z-50 w-full max-h-60 ${classNameTagUl}`}
        >
          {isSearchable && (
            <div className="px-4 py-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Поиск..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <ul className="max-h-48 overflow-y-auto shadow-lg">
            {filteredOptions.map((option) => (
              <li
                key={option.value.toString()}
                className={`px-4 py-3 w-full hover:bg-gray-100 cursor-pointer items-center gap-4 ${classNameTagLi} ${
                  value?.value === option.value ? 'bg-gray-100 font-semibold' : ''
                }`}
                onClick={() => handleOptionClick(option)}
              >
                {renderIcon(option)}
                <span className="flex w-full text-left text-black truncate">{option.label}</span>
                {counter && isOptionTariff(option) && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold ${
                        counterValues[option.value.toString()] === 1
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      disabled={counterValues[option.value.toString()] === 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        decrementCounter(option.value.toString());
                      }}
                    >
                      -
                    </button>
                    <span className="text-center text-black w-8">
                      {counterValues[option.value.toString()]}
                    </span>
                    <button
                      type="button"
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-lg font-bold ${
                        counterValues[option.value.toString()] === option.maxPeople
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      disabled={counterValues[option.value.toString()] === option.maxPeople}
                      onClick={(e) => {
                        e.stopPropagation();
                        incrementCounter(option.value.toString(), option.maxPeople);
                      }}
                    >
                      +
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {error && <div className="text-red-500 text-sm">Ошибка: Выберите корректное значение.</div>}
    </div>
  );
};
