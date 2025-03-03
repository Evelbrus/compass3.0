import React, { FC, useEffect } from 'react';
import { PointWithoutTimestamps } from '@features/orders/create/types/types';
import { cn } from '@shared/lib';
import { showToast } from '@shared/components/toast/ToastManager';

interface PointDropdownProps {
  selectorRef?: React.RefObject<HTMLDivElement | null>;
  observerRef?: React.RefObject<HTMLDivElement | null>;
  search: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredPoints: PointWithoutTimestamps[];
  loading?: boolean;
  departurePoint?: PointWithoutTimestamps | null;
  arrivalPoint?: PointWithoutTimestamps | null;
  additionalPoints?: (PointWithoutTimestamps | null)[];
  currentSelectorType: 'departurePoint' | 'arrivalPoint' | 'additionalPoints';
  activeIndex?: number | null;
  onSelectPoint: (point: PointWithoutTimestamps, index?: number) => void;
  onClose?: () => void;
  requiresAirportService?: boolean;
  positionStyles: React.CSSProperties;
}

const PointDropdown: FC<PointDropdownProps> = ({
  selectorRef,
  observerRef,
  search,
  handleSearchChange,
  filteredPoints,
  loading,
  departurePoint,
  arrivalPoint,
  additionalPoints = [],
  currentSelectorType,
  activeIndex,
  onSelectPoint,
  onClose,
  requiresAirportService = false,
  positionStyles,
}) => {
  const isPointAlreadySelected = (point: PointWithoutTimestamps, currentIndex?: number) => {
    if (!point) return false;

    if (currentSelectorType !== 'departurePoint' && departurePoint?.uuid === point.uuid) {
      return true;
    }

    if (currentSelectorType !== 'arrivalPoint' && arrivalPoint?.uuid === point.uuid) {
      return true;
    }

    if (
      currentSelectorType !== 'additionalPoints' &&
      additionalPoints &&
      additionalPoints.length > 0
    ) {
      return additionalPoints.some((p) => p !== null && p.uuid === point.uuid);
    }

    if (
      currentSelectorType === 'additionalPoints' &&
      additionalPoints &&
      additionalPoints.length > 0
    ) {
      return additionalPoints.some(
        (p, idx) => p !== null && p.uuid === point.uuid && idx !== currentIndex,
      );
    }

    return false;
  };

  useEffect(() => {
    const searchInput = selectorRef?.current?.querySelector('input');
    if (searchInput) {
      setTimeout(() => {
        searchInput.focus();
      }, 0);
    }
  }, [selectorRef]);

  return (
    <div
      className="absolute z-[1000] bg-white rounded-lg shadow-xl overflow-y-auto border border-gray-100"
      ref={selectorRef}
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        ...positionStyles,
      }}
    >
      <div className="sticky top-0 bg-white p-3 border-b">
        <div className="relative">
          <input
            type="text"
            autoFocus
            value={search}
            onChange={handleSearchChange}
            placeholder="Поиск..."
            className="p-2 w-full rounded-md bg-gray-50 pl-9 focus:outline-none focus:ring-2 focus:ring-gray-200 text-black"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
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
            const pointAlreadySelected = isPointAlreadySelected(
              point,
              currentSelectorType === 'additionalPoints' && activeIndex !== null
                ? activeIndex
                : undefined,
            );

            const pointPrice = point.pricePerKm ? Number(point.pricePerKm) : 0;
            const terrainDifficulty = point.terrainDifficulty || 1;

            return (
              <div
                key={point.uuid}
                onClick={() => {
                  if (pointAlreadySelected) {
                    showToast.error('Эта точка уже выбрана в другом селекторе');
                    return;
                  }

                  if (
                    currentSelectorType === 'additionalPoints' &&
                    activeIndex !== undefined &&
                    activeIndex !== null
                  ) {
                    const firstEmptyIndex = additionalPoints.findIndex((p) => p === null);
                    if (firstEmptyIndex !== -1) {
                      onSelectPoint(point, firstEmptyIndex);
                    } else {
                      onSelectPoint(point, activeIndex);
                    }
                  } else {
                    onSelectPoint(point);
                  }

                  if (onClose) {
                    onClose();
                  }
                }}
                className={cn(
                  'p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 transition duration-150 text-black',
                  pointAlreadySelected ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : '',
                )}
              >
                <div className="flex justify-between">
                  <span className="max-w-md">
                    {point.address}{' '}
                    {requiresAirportService && !point.airport && (
                      <span className="text-xs text-gray-500">(Требуется аэропорт для услуг)</span>
                    )}
                  </span>
                  {pointAlreadySelected && (
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
      {observerRef && <div ref={observerRef} className="h-1" />}
    </div>
  );
};

export default PointDropdown;
