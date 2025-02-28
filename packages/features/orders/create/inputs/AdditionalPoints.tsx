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
  onOpenSelect: () => void;
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
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-pink-500',
];

const BORDER_COLORS = [
  'border-green-200',
  'border-purple-200',
  'border-orange-200',
  'border-cyan-200',
  'border-pink-200',
];

const SHADOW_COLORS = [
  'shadow-green-100',
  'shadow-purple-100',
  'shadow-orange-100',
  'shadow-cyan-100',
  'shadow-pink-100',
];

const AdditionalPoints: React.FC<AdditionalPointsProps> = ({
  control,
  name,
  label,
  isOpen,
  onOpenSelect,
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

  // Определяем, есть ли активные точки для правильного отображения линии
  const hasActivePoints = selectedPoints.some((point) => point !== null);

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
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-bold shadow-md">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="font-semibold bg-gradient-to-r from-indigo-400 to-blue-600 bg-clip-text text-transparent">
              {label}
            </div>
          </div>

          <div className="relative w-full rounded-lg p-4 shadow-sm border-2 border-indigo-100">
            {/* Вертикальная линия реализована с фиксированной позицией */}
            {hasActivePoints && (
              <div className="absolute left-4 top-0 bottom-0 h-full flex items-center justify-center pointer-events-none">
                <div className="w-0.5 h-[calc(100%-20px)] bg-gradient-to-b from-green-400 via-purple-400 to-pink-400 opacity-40 rounded-full"></div>
              </div>
            )}

            <div className="space-y-4 relative">
              {Array.from({ length: MAX_POINTS }).map((_, index) => {
                const point = selectedPoints[index];
                const letter = String.fromCharCode(67 + index);
                const bgColor = BACKGROUND_COLORS[index];
                const borderColor = BORDER_COLORS[index];
                const shadowColor = SHADOW_COLORS[index];

                return (
                  <div key={index} className="flex flex-row items-center gap-3 relative">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} text-white font-bold shadow-md`}
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
                      className={`p-2 border-2 ${borderColor} rounded-md w-16 text-center shadow-sm ${shadowColor} bg-white focus:outline-none focus:ring-2 focus:ring-blue-300`}
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
                          className={`w-full p-3 border-2 ${borderColor} rounded-md cursor-pointer shadow-sm ${shadowColor} bg-white focus:outline-none`}
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
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm transition duration-200 hover:shadow-md"
                          >
                            ✕
                          </button>
                        )}

                        {point && point.airport && (
                          <div className="absolute left-3 -bottom-5 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            Аэропорт
                          </div>
                        )}
                      </div>

                      {isOpen && activeIndex === index && (
                        <div
                          className="absolute z-50 w-full bg-white border-2 border-blue-200 rounded-lg mt-2 shadow-lg max-h-[250px] overflow-y-auto"
                          ref={activeIndex === index ? selectorRef : undefined}
                        >
                          <div className="sticky top-0 bg-white p-3 border-b">
                            <input
                              type="text"
                              autoFocus
                              value={search}
                              onChange={handleSearchChange}
                              placeholder="Поиск..."
                              className="p-2 w-full border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                                    className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 transition duration-150 ${
                                      isAlreadySelected
                                        ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                        : ''
                                    }`}
                                    onClick={() => {
                                      if (isAlreadySelected) {
                                        showToast.error('Эта точка уже выбрана');
                                        return;
                                      }

                                      onSelectPoint(pointOption, index);
                                      setActiveIndex(null);
                                    }}
                                  >
                                    <div className="flex justify-between">
                                      <span>{pointOption.address}</span>
                                      {isAlreadySelected && (
                                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                          Уже выбрана
                                        </span>
                                      )}
                                    </div>
                                    {pointOption.airport && (
                                      <div className="flex items-center mt-1 text-xs text-blue-600">
                                        <svg
                                          className="w-4 h-4 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                        Аэропорт
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                <svg
                                  className="w-6 h-6 text-gray-400 mx-auto mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                Нет результатов
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg text-sm text-gray-600 flex items-start">
              <svg
                className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                Вы можете указать до 5 промежуточных точек и изменить их порядок с помощью
                селекторов. Промежуточные точки помогут построить оптимальный маршрут с учетом всех
                необходимых остановок.
              </div>
            </div>
          </div>
        </div>
      )}
    />
  );
};

export default AdditionalPoints;
