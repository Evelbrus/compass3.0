'use client';

import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { SelectorProps } from '@shared/components/ui/inputs/selector';
import { ArrowIcon } from '@shared/components/ui/icon';
import { CheckboxInput } from '@shared/components/ui/inputs';

export const Selector: React.FC<SelectorProps> = ({
  name,
  label,
  options = [],
  selectedValues,
  placeholder,
  icon,
  mode = 'rows',
  status = 'default',
  isOpen,
  onToggle,
  onSelectionChange,
}) => {
  const { control } = useFormContext();

  const handleToggleOption = (optionValue: string) => {
    if (onSelectionChange) {
      onSelectionChange(optionValue);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={() => (
        <div
          className={`w-full border rounded-lg bg-white transition-colors duration-300`}
          data-mode={mode}
          data-status={status}
          data-is-active={isOpen}
        >
          <div
            className="flex items-center justify-between gap-2 p-2 cursor-pointer"
            onClick={onToggle}
            data-selected={selectedValues.length > 0}
          >
            {icon && <span className="mr-2">{icon}</span>}
            <span className="text-[14px] font-[500] leading-[24px] text-left font-sans">
              {placeholder || label}
            </span>
            <ArrowIcon />
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden space-y-2 ${
              isOpen ? 'p-2 max-h-52 opacity-100 delay-100' : 'max-h-0 opacity-0 delay-0'
            }`}
            style={{ maxHeight: isOpen ? '300px' : '0', overflowY: 'auto' }}
          >
            {options.length > 0 ? (
              options.map((option) => (
                <Controller
                  key={option.value}
                  name={name}
                  control={control}
                  render={() => (
                    <CheckboxInput
                      label={option.label}
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleToggleOption(option.value)}
                      className="w-full text-[14px] font-[500] leading-[24px] text-left font-sans"
                      position="right"
                    />
                  )}
                />
              ))
            ) : (
              <p className="p-2 text-gray-500">Нет доступных опций</p>
            )}
          </div>
        </div>
      )}
    />
  );
};

Selector.displayName = 'Selector';
