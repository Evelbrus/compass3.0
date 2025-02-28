import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Point } from '@prisma/client';
import { cn } from '@shared/lib';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';

// Определяем тип PointWithoutTimestamps, как в других местах
type PointWithoutTimestamps = Pick<
  Point,
  'uuid' | 'address' | 'pricePerKm' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
>;

// Уточним тип name, чтобы это было только поле типа PointWithoutTimestamps | null
type PointFieldName = Extract<keyof FormOrderValues, 'departurePoint' | 'arrivalPoint'>;

interface PointSelectorProps {
  control: Control<FormOrderValues>;
  name: PointFieldName;
  label: string;
  isOpen: boolean;
  searchValue: string;
  onOpenSelect: () => void;
  onSearchValueChange: (value: string) => void;
  search: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredPoints: PointWithoutTimestamps[]; // Обновили тип
  loading: boolean;
  onSelectPoint: (point: PointWithoutTimestamps | null) => void; // Обновили тип
  selectorRef: React.RefObject<HTMLDivElement | null>;
  observerRef: React.RefObject<HTMLDivElement | null>;
  selectedPoint: PointWithoutTimestamps | null | undefined; // Обновили тип
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
  search,
  handleSearchChange,
  filteredPoints,
  loading,
  onSelectPoint,
  selectorRef,
  observerRef,
  selectedPoint,
  arrivalPointPrice,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        // Мы точно знаем, что field.value типа PointWithoutTimestamps | null
        const pointValue = field.value as PointWithoutTimestamps | null;

        // Определяем букву и цвета в зависимости от типа точки
        const letter = name === 'departurePoint' ? 'A' : 'B';
        const bgColor = name === 'departurePoint' ? 'bg-blue-100' : 'bg-red-100';
        const textColor = name === 'departurePoint' ? 'text-blue-600' : 'text-red-600';

        return (
          <div ref={selectorRef} className="relative">
            <div className="flex items-center gap-2 mb-2">
              {/* Круговой фон для буквы */}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} ${textColor} font-bold`}
              >
                {letter}
              </div>

              <label className="block text-sm font-medium text-gray-500">{label}</label>
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
                  'w-full rounded p-2 focus:outline-none focus:ring border',
                  fieldState.error ? 'border-red-500' : 'border-gray-300 focus:border-blue-300',
                  'text-gray-900 placeholder-gray-400',
                )}
              />

              {pointValue && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectPoint(null);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700"
                  aria-label="Очистить"
                >
                  ✕
                </button>
              )}
            </div>

            {fieldState.error && (
              <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
            )}

            {isOpen && (
              <div
                className={cn(
                  'absolute bg-white rounded-md z-50 max-h-60 overflow-auto mt-2 border border-gray-300',
                  'w-full',
                )}
              >
                {/* Добавляем поле поиска внутри выпадающего списка */}
                <div className="sticky top-0 bg-white p-2 border-b">
                  <input
                    type="text"
                    autoFocus
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Поиск..."
                    className="p-2 w-full border rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                <div className="max-h-[200px] overflow-y-auto">
                  {loading ? (
                    <div className="p-2 text-gray-500">Загрузка...</div>
                  ) : filteredPoints.length > 0 ? (
                    filteredPoints.map((point) => {
                      const isAlreadySelected =
                        (name === 'departurePoint' &&
                          selectedPoint?.uuid !== point.uuid &&
                          (document.querySelector('[name="arrivalPoint"]') as any)?.value?.uuid ===
                            point.uuid) ||
                        (name === 'arrivalPoint' &&
                          selectedPoint?.uuid !== point.uuid &&
                          (document.querySelector('[name="departurePoint"]') as any)?.value
                            ?.uuid === point.uuid);

                      return (
                        <div
                          key={point.uuid}
                          onClick={() => {
                            if (isAlreadySelected) {
                              return; // Не даем выбрать уже выбранную точку
                            }
                            onSelectPoint(point);
                          }}
                          className={cn(
                            'px-4 py-2 hover:bg-gray-100 cursor-pointer',
                            pointValue?.uuid === point.uuid ? 'bg-blue-50 font-semibold' : '',
                            isAlreadySelected ? 'text-gray-400 bg-gray-50' : '',
                          )}
                        >
                          <div className="flex justify-between">
                            <span>{point.address}</span>
                            {isAlreadySelected && (
                              <span className="text-xs text-red-500">Уже выбрана</span>
                            )}
                          </div>
                          {arrivalPointPrice && name === 'arrivalPoint' && (
                            <span className="text-gray-500 text-sm block">
                              Цена: {arrivalPointPrice} сом/км
                            </span>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-2 text-gray-500 text-center">Нет доступных точек</div>
                  )}
                </div>
                <div ref={observerRef} />
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export default PointSelector;
