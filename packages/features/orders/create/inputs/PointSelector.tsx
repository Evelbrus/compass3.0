import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Point } from '@prisma/client';
import { cn } from '@shared/lib';

interface PointSelectorProps {
  control: Control<any>;
  name: string;
  label: string;
  isOpen: boolean;
  searchValue: string;
  onOpenSelect: () => void;
  onSearchValueChange: (value: string) => void;
  search: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredPoints: Point[];
  loading: boolean;
  onSelectPoint: (point: Point | null) => void;
  selectorRef: React.RefObject<HTMLDivElement | null>;
  observerRef: React.RefObject<HTMLDivElement | null>;
  selectedPoint: Point | null | undefined;
  arrivalPointPrice?: number;
}

const PointSelector: React.FC<PointSelectorProps> = ({
                                                       control,
                                                       name,
                                                       label,
                                                       isOpen,
                                                       searchValue,
                                                       onOpenSelect,
                                                       onSearchValueChange,
                                                       handleSearchChange,
                                                       filteredPoints,
                                                       loading,
                                                       onSelectPoint,
                                                       selectorRef,
                                                       observerRef,
                                                       selectedPoint,
                                                       arrivalPointPrice,
                                                     }) => {
  const displayLabel = name === 'departurePoint' ? `${label} (A)` : `${label} (B)`;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div ref={selectorRef} className="relative">
          <label className="block text-sm font-medium text-gray-500 mb-2">{displayLabel}</label>
          <input
            {...field}
            value={searchValue}
            onChange={(e) => {
              handleSearchChange(e);
              onSearchValueChange(e.target.value);
              field.onChange(e.target.value);
            }}
            onFocus={onOpenSelect}
            placeholder="Введите адрес..."
            className={cn(
              'w-full rounded p-2 focus:outline-none focus:ring border border-gray-300 focus:border-blue-300',
              'text-gray-900 placeholder-gray-400',
            )}
          />
          {isOpen && (
            <div
              className={cn(
                'absolute bg-white rounded-md z-50 max-h-60 overflow-auto mt-2 border border-gray-300',
                'w-full',
              )}
            >
              {loading ? (
                <div className="p-2 text-gray-500">Загрузка...</div>
              ) : (
                filteredPoints.map((point) => (
                  <div
                    key={point.uuid}
                    onClick={() => onSelectPoint(point)}
                    className={cn(
                      'px-4 py-2 hover:bg-gray-100 cursor-pointer',
                      selectedPoint?.uuid === point.uuid ? 'bg-gray-100 font-semibold' : '',
                    )}
                  >
                    {point.address}
                    {arrivalPointPrice && name === 'arrivalPoint' && (
                      <span className="text-gray-500"> ({arrivalPointPrice} сом/км)</span>
                    )}
                  </div>
                ))
              )}
              <div ref={observerRef} />
            </div>
          )}
        </div>
      )}
    />
  );
};

export default PointSelector;