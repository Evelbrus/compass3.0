import React, { useState, useEffect, useRef } from 'react';
import { Control, Controller } from 'react-hook-form';
import { TariffOnService } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { cn } from '@shared/lib';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { PointWithoutTimestamps } from '@features/orders/create/types/types';

interface AdditionalPointsProps {
  control: Control<FormOrderValues>;
  name: keyof FormOrderValues;
  label: string;
  isOpen: boolean;
  onOpenSelect: () => void;
  search: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredPoints: PointWithoutTimestamps[];
  onSelectPoint: (point: PointWithoutTimestamps | null, index: number) => void;
  selectorRef: React.RefObject<HTMLDivElement | null>;
  selectedPoints: (PointWithoutTimestamps | null)[];
  onRemovePoint: (index: number) => void;
  onChangeOrder: (currentIndex: number, newIndex: number) => void;
  // Добавленные props для проверки дубликатов
  departurePoint: PointWithoutTimestamps | null;
  arrivalPoint: PointWithoutTimestamps | null;
  additionalPoints: (PointWithoutTimestamps | null)[];
  currentSelectorType: string;
  selectedServices?: TariffOnService[];
  availableServices?: Array<{
    service: any;
    price: number;
    isAvailable: boolean;
    tariffOnServiceUuid: string | null;
  }>;
}

const MAX_POINTS = 5;

// Оставляем оригинальные цвета для букв
const BACKGROUND_COLORS = [
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-pink-500',
];

const BORDER_COLORS = [
  'border-cyan-300',
  'border-cyan-300',
  'border-cyan-300',
  'border-cyan-300',
  'border-cyan-300',
];

const SHADOW_COLORS = [
  'shadow-cyan-100',
  'shadow-cyan-100',
  'shadow-cyan-100',
  'shadow-cyan-100',
  'shadow-cyan-100',
];

export const AdditionalPoints: React.FC<AdditionalPointsProps> = ({
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
  departurePoint,
  arrivalPoint,
  additionalPoints,
  selectedServices = [],
  availableServices = [],
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // Создаем массив ссылок на DOM-элементы для каждого инпута
  const inputRefs = useRef<Array<HTMLDivElement | null>>([]);
  // Инициализируем массив ссылок
  if (inputRefs.current.length !== MAX_POINTS) {
    inputRefs.current = Array(MAX_POINTS).fill(null);
  }

  // Положение селектора (вверх или вниз)
  const [dropDirection, setDropDirection] = useState<'up' | 'down'>('down');

  // Обработчик клика вне селектора
  useEffect(() => {
    if (activeIndex === null) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (selectorRef.current && !selectorRef.current.contains(target)) {
        setActiveIndex(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeIndex, selectorRef]);

  useEffect(() => {
    if (activeIndex !== null && !isOpen) onOpenSelect();
  }, [activeIndex, isOpen, onOpenSelect]);

  // Функция для определения направления выпадающего списка
  const determineDropDirection = (index: number) => {
    const inputElement = inputRefs.current[index];
    if (!inputElement) return 'down';

    const rect = inputElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Размер селектора (предполагаемый)
    const dropdownHeight = 250;

    // Проверяем, есть ли достаточно места снизу
    const spaceBelow = viewportHeight - rect.bottom;
    if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
      return 'up';
    }

    return 'down';
  };

  // Обработчик открытия селектора для определенного индекса
  const handleOpenSelect = (index: number) => {
    // Определяем направление выпадения при открытии
    const direction = determineDropDirection(index);
    setDropDirection(direction);
    setActiveIndex(index);
    onOpenSelect();
  };

  // Проверка, выбрана ли точка в основных точках или других дополнительных точках
  const isPointAlreadySelected = (point: PointWithoutTimestamps, currentIndex: number) => {
    if (!point) return false;

    // Проверка точки отправления
    if (departurePoint?.uuid === point.uuid) {
      return true;
    }

    // Проверка точки прибытия
    if (arrivalPoint?.uuid === point.uuid) {
      return true;
    }

    // Проверка других дополнительных точек
    if (additionalPoints && additionalPoints.length > 0) {
      return additionalPoints.some(
        (p, idx) => p !== null && p.uuid === point.uuid && idx !== currentIndex,
      );
    }

    return false;
  };

  // Проверяем, требуются ли аэропортовые услуги
  const requiresAirportService = selectedServices.some((service) =>
    availableServices
      ?.find((s) => s.tariffOnServiceUuid === service.uuid)
      ?.service.name.toLowerCase()
      .includes('аэропорт'),
  );

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="w-full relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
              {label}
              <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
            </div>
          </div>

          <div className="relative w-full">
            <div className="relative flex flex-col gap-8">
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
                      className={`p-2 border-2 ${borderColor} rounded-md w-16 text-center shadow-sm ${shadowColor} bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-50`}
                    >
                      {Array.from({ length: MAX_POINTS }, (_, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>

                    <div
                      className="flex-1 relative additional-point-selector"
                      ref={(el) => void (inputRefs.current[index] = el)}
                    >
                      <div className="relative w-full">
                        <input
                          type="text"
                          value={point ? point.address : ''}
                          onClick={() => handleOpenSelect(index)}
                          placeholder={`Выберите точку ${index + 1}`}
                          className={`w-full p-3 border-2 ${borderColor} rounded-md cursor-pointer shadow-sm ${shadowColor} bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all duration-200 hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-50`}
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
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition duration-200 hover:shadow-md"
                          >
                            ✕
                          </button>
                        )}

                        {point && (
                          <div className="flex gap-2 absolute left-3 -bottom-5">
                            {point.airport && (
                              <div className="text-xs bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full">
                                Аэропорт
                              </div>
                            )}
                            <div className="text-xs bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full">
                              {Number(point.pricePerKm)} сом/км
                            </div>
                            {point.terrainDifficulty && point.terrainDifficulty !== 1 && (
                              <div className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                                Коэф. сложности: {point.terrainDifficulty}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {isOpen && activeIndex === index && (
                        <div
                          className={cn(
                            'absolute z-50 w-full bg-white border-2 border-cyan-200 rounded-lg shadow-lg max-h-[250px] overflow-y-auto',
                            dropDirection === 'up'
                              ? 'bottom-full mb-2' // Если направление вверх, показываем над инпутом
                              : 'top-full mt-2', // Если направление вниз, показываем под инпутом
                          )}
                          ref={activeIndex === index ? selectorRef : undefined}
                        >
                          <div className="sticky top-0 bg-white p-3 border-b">
                            <input
                              type="text"
                              autoFocus
                              value={search}
                              onChange={handleSearchChange}
                              placeholder="Поиск..."
                              className="p-2 w-full border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500"
                            />
                          </div>

                          <div>
                            {filteredPoints.length > 0 ? (
                              filteredPoints.map((pointOption) => {
                                // Используем новую функцию для проверки
                                const isAlreadySelected = isPointAlreadySelected(
                                  pointOption,
                                  activeIndex !== null ? activeIndex : -1,
                                );

                                // Получаем цену за км для этой точки
                                const pointPrice = pointOption.pricePerKm
                                  ? Number(pointOption.pricePerKm)
                                  : 0;
                                const terrainDifficulty = pointOption.terrainDifficulty || 1;

                                return (
                                  <div
                                    key={pointOption.uuid}
                                    className={cn(
                                      'p-3 cursor-pointer hover:bg-cyan-50 border-b last:border-b-0 transition duration-150',
                                      isAlreadySelected
                                        ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                        : '',
                                    )}
                                    onClick={() => {
                                      if (isAlreadySelected) {
                                        showToast.error('Эта точка уже выбрана в другом селекторе');
                                        return;
                                      }

                                      onSelectPoint(
                                        pointOption,
                                        activeIndex !== null ? activeIndex : 0,
                                      );
                                      setActiveIndex(null);
                                    }}
                                  >
                                    <div className="flex justify-between">
                                      <span>
                                        {pointOption.address}{' '}
                                        {requiresAirportService && !pointOption.airport && (
                                          <span className="text-xs text-gray-500">
                                            (Требуется аэропорт для услуг)
                                          </span>
                                        )}
                                      </span>
                                      {isAlreadySelected && (
                                        <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                          Уже выбрана
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                      {pointOption.airport && (
                                        <div className="flex items-center text-xs text-cyan-600">
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
                                      {/* Показываем цену за км и коэффициент сложности для каждой точки */}
                                      <div className="text-gray-500 text-sm flex items-center gap-2">
                                        <span>{pointPrice} сом/км</span>
                                        {terrainDifficulty !== 1 && (
                                          <span className="bg-orange-50 text-orange-600 rounded-full px-2 py-0.5 text-xs">
                                            Коэф. сложности: {terrainDifficulty}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                <svg
                                  className="w-6 h-6 text-cyan-400 mx-auto mb-2"
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

            <div className="mt-6 bg-blue-50 p-3 rounded-lg text-sm text-gray-600 flex items-start">
              <svg
                className="w-5 h-5 text-cyan-500 mr-2 flex-shrink-0 mt-0.5"
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
