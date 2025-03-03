import React, { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { PointWithoutTimestamps } from '@features/orders/create/types/types';
import { FormOrderValues } from '@features/orders/create/hooks';

const STYLES = {
  departurePoint: {
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
    icon: 'A',
  },
  arrivalPoint: {
    bgColor: 'bg-red-600',
    textColor: 'text-white',
    icon: 'B',
  },
};

interface PointSelectorProps {
  name: keyof typeof STYLES;
  isOpen: boolean;
  onOpenSelect: () => void;
  onSearchValueChange: (value: string) => void;
  onSelectPoint: (point: PointWithoutTimestamps | null) => void;
}

export const PointSelector: React.FC<PointSelectorProps> = ({
  name,
  isOpen,
  onOpenSelect,
  onSelectPoint,
}) => {
  const { control, clearErrors } = useFormContext<FormOrderValues>();

  const inputRef = useRef<HTMLDivElement>(null);

  // Модифицированный handleOpenSelect для очистки ошибки при клике
  const handleOpenSelect = () => {
    // Очищаем ошибку при клике
    if (clearErrors) {
      clearErrors(name);
    }

    // Вызываем оригинальный обработчик
    onOpenSelect();
  };

  const handlePointSelect = (point: PointWithoutTimestamps | null) => {
    // При выборе точки очищаем ошибку
    if (clearErrors) {
      clearErrors(name);
    }

    // Вызываем оригинальный обработчик
    onSelectPoint(point);
  };

  const DropdownArrow = ({ isActive }: { isActive: boolean }) => (
    <svg
      className="w-5 h-5 text-gray-500 transition-transform duration-300 ease-in-out"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path
        d="M7 10L12 15L17 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const pointValue = field.value as PointWithoutTimestamps | null;
        const { bgColor, textColor, icon } = STYLES[name];

        return (
          <div className="relative">
            <div
              className={`flex items-center gap-3 p-3 hover:bg-gradient-to-r ${
                name === 'departurePoint' ? 'hover:from-blue-50' : 'hover:from-red-50'
              } hover:to-transparent transition-all duration-200 cursor-pointer border-b ${
                fieldState.error ? 'border-red-500 bg-red-50/30' : ''
              }`}
              onClick={handleOpenSelect}
              ref={inputRef}
            >
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} ${textColor} font-bold shadow-md`}
              >
                {icon}
              </div>
              <div className="flex-1 relative overflow-hidden">
                <div className="relative w-full transition-opacity">
                  <div
                    className={`w-full p-3 pl-0 rounded-md cursor-pointer flex items-center whitespace-nowrap overflow-hidden text-ellipsis ${
                      fieldState.error ? 'text-red-500' : 'text-white'
                    }`}
                  >
                    {pointValue ? pointValue.address : `Выберите адрес ${icon}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {pointValue ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePointSelect(null);
                    }}
                    className="text-red-500 hover:text-red-700 bg-gray-50/30 p-1 rounded-full hover:bg-red-50 transition duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M6 18L18 6M6 6l12 12"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : (
                  <DropdownArrow isActive={isOpen} />
                )}
              </div>
            </div>
            {fieldState.error && (
              <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
};
