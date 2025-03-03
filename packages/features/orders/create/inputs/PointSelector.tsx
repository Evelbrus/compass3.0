import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { cn } from '@shared/lib';
import { Point } from '@prisma/client';

type PointWithoutTimestamps = Pick<
  Point,
  'uuid' | 'address' | 'pricePerKm' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
>;

// Стили для разных типов точек с оригинальными цветами фона
const STYLES = {
  departurePoint: {
    bgColor: 'bg-blue-600',
    borderColor: 'border-cyan-300',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'A',
  },
  arrivalPoint: {
    bgColor: 'bg-cyan-600',
    borderColor: 'border-cyan-300',
    shadowColor: 'shadow-cyan-100',
    textColor: 'text-white',
    icon: 'B',
  },
  // Оставляем оригинальные цвета фона
};

interface PointSelectorProps {
  control: any;
  name: keyof typeof STYLES; // Ограничиваем name ключами STYLES
  label: string;
  isOpen: boolean;
  searchValue: string;
  onOpenSelect: () => void;
  onSearchValueChange: (value: string) => void;
  search: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredPoints: PointWithoutTimestamps[];
  loading: boolean;
  onSelectPoint: (point: PointWithoutTimestamps | null) => void;
  selectorRef: React.RefObject<HTMLDivElement | null>;
  observerRef?: React.RefObject<HTMLDivElement | null>;
  selectedPoint: PointWithoutTimestamps | null;
  selectedServices?: string[];
  availableServices?: Array<{
    service: any;
    price: number;
    isAvailable: boolean;
    tariffOnServiceUuid: string | null;
  }>;
  // Добавленные props для проверки дубликатов
  departurePoint: PointWithoutTimestamps | null;
  arrivalPoint: PointWithoutTimestamps | null;
  additionalPoints: (PointWithoutTimestamps | null)[];
  currentSelectorType: string;
}

const PointSelector: React.FC<PointSelectorProps> = ({
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
                                                       loading,
                                                       onSelectPoint,
                                                       selectorRef,
                                                       observerRef,
                                                       selectedPoint,
                                                       selectedServices = [],
                                                       availableServices = [],
                                                       departurePoint,
                                                       arrivalPoint,
                                                       additionalPoints,
                                                       currentSelectorType,
                                                     }) => {
  // Функция для проверки, выбрана ли точка в других селекторах
  const isPointAlreadySelected = (point: PointWithoutTimestamps) => {
    if (!point) return false;

    // Проверка точки отправления (если текущий селектор не для точки отправления)
    if (currentSelectorType !== 'departurePoint' && departurePoint?.uuid === point.uuid) {
      return true;
    }

    // Проверка точки прибытия (если текущий селектор не для точки прибытия)
    if (currentSelectorType !== 'arrivalPoint' && arrivalPoint?.uuid === point.uuid) {
      return true;
    }

    // Проверка дополнительных точек (если текущий селектор не для доп. точек)
    if (
      currentSelectorType !== 'additionalPoints' &&
      additionalPoints &&
      additionalPoints.length > 0
    ) {
      return additionalPoints.some((p) => p !== null && p.uuid === point.uuid);
    }

    return false;
  };

  // Добавляем обработчик клика вне селектора для закрытия
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        // Закрыть селектор
        onSearchValueChange(selectedPoint?.address || '');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onSearchValueChange, selectedPoint, selectorRef]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const pointValue = field.value as PointWithoutTimestamps | null;
        const { bgColor, borderColor, shadowColor, textColor, icon } = STYLES[name];

        // Проверяем, требуются ли аэропортовые услуги
        const requiresAirportService = selectedServices.some((uuid) =>
          availableServices
            ?.find((s) => s.tariffOnServiceUuid === uuid)
            ?.service.name.toLowerCase()
            .includes('аэропорт'),
        );

        return (
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} ${textColor} font-bold shadow-md`}
              >
                {icon}
              </div>
              <div
                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700"
              >
                {label}
              </div>
            </div>

            <div className="relative">
              <input
                value={pointValue?.address || searchValue || ''}
                onChange={(e) => {
                  handleSearchChange(e);
                  onSearchValueChange(e.target.value);
                }}
                onFocus={onOpenSelect}
                placeholder="Введите адрес..."
                className={cn(
                  'w-full p-3 border-2 rounded-md cursor-pointer bg-white transition-all duration-200',
                  'border-cyan-200 shadow-sm shadow-cyan-100',
                  fieldState.error ? 'border-red-500' : '',
                  'focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500',
                  'hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-50'
                )}
              />
              {pointValue && (
                <button
                  type="button"
                  onClick={() => onSelectPoint(null)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg transition duration-200 hover:shadow-md"
                  aria-label="Очистить"
                >
                  ✕
                </button>
              )}
              {pointValue?.airport && (
                <div className="absolute left-3 -bottom-5 text-xs bg-cyan-50 text-cyan-600 px-2 py-0.5 rounded-full">
                  Аэропорт
                </div>
              )}
            </div>

            {fieldState.error && (
              <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
            )}

            {isOpen && (
              <div
                ref={selectorRef}
                className={cn(
                  'absolute z-[9999] w-full bg-white border-2 rounded-lg mt-2 shadow-lg max-h-[250px] overflow-y-auto',
                  'border-cyan-200'
                )}
              >
                <div className="sticky top-0 bg-white p-3 border-b border-gray-200">
                  <input
                    type="text"
                    autoFocus
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Поиск..."
                    className="p-2 w-full border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div>
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">
                      <svg
                        className="w-6 h-6 text-cyan-400 mx-auto mb-2 animate-spin"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                        />
                      </svg>
                      Загрузка...
                    </div>
                  ) : filteredPoints.length > 0 ? (
                    filteredPoints.map((point) => {
                      // Используем нашу новую функцию для проверки
                      const isAlreadySelected = isPointAlreadySelected(point);

                      // Получаем цену за км для этой точки
                      const pointPrice = point.pricePerKm ? Number(point.pricePerKm) : 0;
                      const terrainDifficulty = point.terrainDifficulty || 1;

                      return (
                        <div
                          key={point.uuid}
                          onClick={() => {
                            if (isAlreadySelected) return;
                            onSelectPoint(point);
                          }}
                          className={cn(
                            'p-3 cursor-pointer hover:bg-cyan-50 border-b border-gray-200 last:border-b-0 transition duration-150',
                            pointValue?.uuid === point.uuid ? 'bg-gradient-to-r from-cyan-50 to-blue-50 font-semibold' : '',
                            isAlreadySelected ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : '',
                          )}
                        >
                          <div className="flex justify-between">
                            <span>
                              {point.address}{' '}
                              {requiresAirportService && !point.airport && (
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
                            {point.airport && (
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
                      Нет доступных точек
                    </div>
                  )}
                </div>
                {observerRef && <div ref={observerRef} />}
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export default PointSelector;