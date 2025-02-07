import React, { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Point } from '@prisma/client';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';

interface OrderStartEndSelectorProps {
  points: Point[] | null;
  selectedDeparturePoint: Point | null;
  selectedArrivalPoint: Point | null;
  handleDepartureSelect: (point: Point | null) => void;
  handleArrivalSelect: (point: Point | null) => void;
  departurePointOptions: Array<{ label: string; value: string; key: string }>;
  arrivalPointOptions: Array<{ label: string; value: string; key: string }>;
  handleDepartureSearchChange: (value: string) => void;
  handleArrivalSearchChange: (value: string) => void;
  handleOpenSelect: () => void;
  departureSearch: string;
  arrivalSearch: string;
  loadMore: (listType: 'departure' | 'arrival') => void;
  total: number;
}

const OrderStartEndSelector: React.FC<OrderStartEndSelectorProps> = ({
  points,
  selectedDeparturePoint,
  selectedArrivalPoint,
  handleDepartureSelect,
  handleArrivalSelect,
  departurePointOptions,
  arrivalPointOptions,
  handleDepartureSearchChange,
  handleArrivalSearchChange,
  handleOpenSelect,
  departureSearch,
  arrivalSearch,
  loadMore,
  total,
}) => {
  const { control, trigger, setValue } = useFormContext<CreateOrderData>();
  const [isDepartureOpen, setIsDepartureOpen] = useState(false);
  const [isArrivalOpen, setIsArrivalOpen] = useState(false);

  //Для списка отправления
  const isLoadingDeparture = useRef(false);
  const lastPageLoadedDeparture = useRef(1);
  const loaderRefDeparture = useRef<HTMLDivElement | null>(null);

  //Для списка прибытия
  const isLoadingArrival = useRef(false);
  const lastPageLoadedArrival = useRef(1);
  const loaderRefArrival = useRef<HTMLDivElement | null>(null);

  //Определение, достигли ли конца списка отправления
  const isAtLastPageDeparture = useMemo(
    () => points && total > 0 && points.length >= total,
    [points, total],
  );

  //Определение, достигли ли конца списка прибытия
  const isAtLastPageArrival = useMemo(
    () => points && total > 0 && points.length >= total,
    [points, total],
  );

  //IntersectionObserver для списка отправления
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      //Добавляем проверку на последнюю страницу
      if (entry.isIntersecting && !isLoadingDeparture.current && !isAtLastPageDeparture) {
        isLoadingDeparture.current = true;
        lastPageLoadedDeparture.current += 1;
        loadMore('departure');
      }
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (loaderRefDeparture.current) {
      observer.observe(loaderRefDeparture.current);
    }

    return () => {
      if (loaderRefDeparture.current) {
        observer.unobserve(loaderRefDeparture.current);
      }
    };
  }, [loadMore, isAtLastPageDeparture]);

  //IntersectionObserver для списка прибытия
  useEffect(() => {
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      //Добавляем проверку на последнюю страницу
      if (entry.isIntersecting && !isLoadingArrival.current && !isAtLastPageArrival) {
        isLoadingArrival.current = true;
        lastPageLoadedArrival.current += 1;
        loadMore('arrival');
      }
    };

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (loaderRefArrival.current) {
      observer.observe(loaderRefArrival.current);
    }

    return () => {
      if (loaderRefArrival.current) {
        observer.unobserve(loaderRefArrival.current);
      }
    };
  }, [loadMore, isAtLastPageArrival]);

  //Сброс состояния загрузки
  useEffect(() => {
    isLoadingDeparture.current = false;
    isLoadingArrival.current = false;
  }, [points]);

  //Обработка клика вне области селектора
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.departure-selector')) setIsDepartureOpen(false);
      if (!target.closest('.arrival-selector')) setIsArrivalOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  //Валидация выбранных точек
  const validateSelection = useCallback(
    (
      selectedPoint: Point | null,
      options: Array<{ value: string }>,
      field: 'departurePoint' | 'arrivalPoint',
    ) => {
      if (selectedPoint && !options.some((opt) => opt.value === selectedPoint.uuid)) {
        setValue(field, '');
        if (field === 'departurePoint') {
          handleDepartureSelect(null);
        } else {
          handleArrivalSelect(null);
        }
      }
    },
    [setValue, handleDepartureSelect, handleArrivalSelect],
  );

  useEffect(() => {
    validateSelection(selectedDeparturePoint, departurePointOptions, 'departurePoint');
  }, [departurePointOptions, selectedDeparturePoint, validateSelection]);

  useEffect(() => {
    validateSelection(selectedArrivalPoint, arrivalPointOptions, 'arrivalPoint');
  }, [arrivalPointOptions, selectedArrivalPoint, validateSelection]);

  return (
    <div className="flex gap-4">
      {/*Селектор точки отправления */}
      <div className="w-full relative departure-selector">
        <label className="block mb-2 text-5 leading-5 font-bold">Откуда?</label>
        <Controller
          name="departurePoint"
          control={control}
          rules={{ required: 'Выберите точку отправления' }}
          render={({ field, fieldState }) => (
            <>
              <input
                type="text"
                value={selectedDeparturePoint?.address || ''}
                onClick={() => {
                  handleOpenSelect();
                  setIsDepartureOpen(true);
                  setIsArrivalOpen(false);
                }}
                placeholder="Отправления"
                readOnly
                className={`text-4 leading-4 p-3 w-full border rounded ${
                  fieldState.error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {isDepartureOpen && (
                <div className="absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto">
                  <input
                    type="text"
                    autoFocus
                    value={departureSearch}
                    onChange={(e) => handleDepartureSearchChange(e.target.value)}
                    placeholder="Поиск..."
                    className="text-4 leading-4 p-3 w-full border-b"
                  />
                  {departurePointOptions.map((option) => (
                    <div
                      key={option.key}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        const point = points?.find((p) => p.uuid === option.value) || null;
                        field.onChange(option.value);
                        handleDepartureSelect(point);
                        trigger('departurePoint');
                        setIsDepartureOpen(false);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                  {/*Скрываем сообщение, если достигли конца списка */}
                  {!isAtLastPageDeparture && (
                    <div ref={loaderRefDeparture} className="p-2 text-center text-gray-500">
                      {isLoadingDeparture.current ? 'Загрузка...' : ''}
                    </div>
                  )}
                </div>
              )}
              {fieldState.error && (
                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      </div>

      {/*Селектор точки прибытия */}
      <div className="w-full relative arrival-selector">
        <label className="block mb-2 text-5 leading-5 font-bold">Куда?</label>
        <Controller
          name="arrivalPoint"
          control={control}
          rules={{ required: 'Выберите точку прибытия' }}
          render={({ field, fieldState }) => (
            <>
              <input
                type="text"
                value={selectedArrivalPoint?.address || ''}
                onClick={() => {
                  handleOpenSelect();
                  setIsArrivalOpen(true);
                  setIsDepartureOpen(false);
                }}
                placeholder="Прибытие"
                readOnly
                className={`text-4 leading-4 p-3 w-full border rounded ${
                  fieldState.error ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {isArrivalOpen && (
                <div className="absolute z-10 w-full bg-white border rounded mt-1 shadow-md max-h-[200px] overflow-y-auto">
                  <input
                    type="text"
                    autoFocus
                    value={arrivalSearch}
                    onChange={(e) => handleArrivalSearchChange(e.target.value)}
                    placeholder="Поиск..."
                    className="text-4 leading-4 p-3 w-full border-b"
                  />
                  {arrivalPointOptions.map((option) => (
                    <div
                      key={option.key}
                      onClick={() => {
                        const point = points?.find((p) => p.uuid === option.value) || null;
                        field.onChange(option.value);
                        handleArrivalSelect(point);
                        trigger('arrivalPoint');
                        setIsArrivalOpen(false);
                      }}
                      className="p-3 cursor-pointer hover:bg-gray-100"
                    >
                      {option.label}
                    </div>
                  ))}
                  {/*Скрываем сообщение, если достигли конца списка */}
                  {!isAtLastPageArrival && (
                    <div ref={loaderRefArrival} className="p-2 text-center text-gray-500">
                      {isLoadingArrival.current ? 'Загрузка...' : ''}
                    </div>
                  )}
                </div>
              )}
              {fieldState.error && (
                <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      </div>
    </div>
  );
};

export default OrderStartEndSelector;
