import React, { useState, useEffect } from 'react';
import { Control, Controller } from 'react-hook-form';
import { Point } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';

type PointWithoutTimestamps = Pick<
  Point,
  'uuid' | 'address' | 'pricePerKm' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
>;

interface AdditionalPointsProps {
  control: Control<FormOrderValues>;
  name: keyof FormOrderValues;
  label: string;
  isOpen: boolean;
  searchValue: string;
  onOpenSelect: () => void;
  onSearchValueChange: (value: string) => void;
  search: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredPoints: PointWithoutTimestamps[];
  onSelectPoint: (point: PointWithoutTimestamps | null, index?: number) => void;
  selectorRef: React.RefObject<HTMLDivElement | null>;
  selectedPoints: (PointWithoutTimestamps | null)[];
  onRemovePoint: (index: number) => void;
  onChangeOrder: (currentIndex: number, newIndex: number) => void;
}

const MAX_POINTS = 5;

const BACKGROUND_COLORS = [
  'bg-green-100',
  'bg-purple-100',
  'bg-orange-100',
  'bg-cyan-100',
  'bg-pink-100',
];

const TEXT_COLORS = [
  'text-green-600',
  'text-purple-600',
  'text-orange-600',
  'text-cyan-600',
  'text-pink-600',
];

const AdditionalPoints: React.FC<AdditionalPointsProps> = ({
  control,
  name,
  label,
  isOpen,
  searchValue,
  onOpenSelect,
  onSearchValueChange,
  search,
  handleSearchChange,
  filteredPoints,
  onSelectPoint,
  selectorRef,
  selectedPoints,
  onRemovePoint,
  onChangeOrder,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const selectors = document.querySelectorAll('.additional-point-selector');
      let insideSelector = false;

      selectors.forEach((selector) => {
        if (selector.contains(target)) insideSelector = true;
      });

      if (!insideSelector) setActiveIndex(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex !== null && !isOpen) onOpenSelect();
  }, [activeIndex, isOpen, onOpenSelect]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="w-full relative">
          <label className="flex p-2 border rounded-md bg-[#989898] text-white">{label}</label>

          <div className="space-y-4 mt-4">
            {Array.from({ length: MAX_POINTS }).map((_, index) => {
              const point = selectedPoints[index];
              const letter = String.fromCharCode(67 + index);
              const bgColor = BACKGROUND_COLORS[index];
              const textColor = TEXT_COLORS[index];

              return (
                <div key={index} className="flex flex-row items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} ${textColor} font-bold`}
                  >
                    {letter}
                  </div>

                  <select
                    value={index + 1}
                    onChange={(e) => {
                      const newIndex = Number(e.target.value) - 1;
                      if (newIndex !== index) {
                        onChangeOrder(index, newIndex);
                        const updatedPoints = [...selectedPoints];
                        const currentPoint = updatedPoints[index] ?? null;
                        updatedPoints.splice(index, 1);
                        updatedPoints.splice(newIndex, 0, currentPoint);
                        field.onChange(updatedPoints);
                      }
                    }}
                    className="p-2 border rounded-md w-16"
                  >
                    {Array.from({ length: MAX_POINTS }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                  </select>

                  <div className="flex-1 relative additional-point-selector">
                    <div className="relative w-full">
                      <input
                        type="text"
                        value={point ? point.address : ''}
                        onClick={() => setActiveIndex(index)}
                        placeholder={`Выберите точку ${index + 1}`}
                        className="w-full p-2 border rounded cursor-pointer"
                        readOnly
                      />

                      {point && (
                        <button
                          type="button"
                          onClick={() => {
                            onRemovePoint(index);
                            const updatedPoints = [...selectedPoints];
                            updatedPoints[index] = null;
                            field.onChange(updatedPoints);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {isOpen && activeIndex === index && (
                      <div
                        className="absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto"
                        ref={activeIndex === index ? selectorRef : undefined}
                      >
                        <div className="sticky top-0 bg-white p-2 border-b">
                          <input
                            type="text"
                            autoFocus
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Поиск..."
                            className="p-2 w-full border rounded"
                          />
                        </div>

                        <div>
                          {filteredPoints.length > 0 ? (
                            filteredPoints.map((pointOption) => {
                              const isAlreadySelected = selectedPoints.some(
                                (p) => p && p.uuid === pointOption.uuid && p !== point,
                              );

                              return (
                                <div
                                  key={pointOption.uuid}
                                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                                    isAlreadySelected ? 'text-gray-400' : ''
                                  }`}
                                  onClick={() => {
                                    console.log('Point clicked:', pointOption.address, index); // Отладка
                                    if (isAlreadySelected) {
                                      showToast.error('Эта точка уже выбрана');
                                      return;
                                    }

                                    onSelectPoint(pointOption, index); // Только вызов обработчика
                                    setActiveIndex(null); // Закрываем селектор
                                  }}
                                >
                                  <div className="flex justify-between">
                                    <span>{pointOption.address}</span>
                                    {isAlreadySelected && (
                                      <span className="text-xs text-red-500">Уже выбрана</span>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-4 text-center text-gray-500">Нет результатов</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Вы можете указать до 5 промежуточных точек и изменить их порядок с помощью селекторов.
          </div>
        </div>
      )}
    />
  );
};

export default AdditionalPoints;
