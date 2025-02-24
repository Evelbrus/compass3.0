import React, { useState, useRef, useCallback } from 'react';
import { UseFormSetValue, Control } from 'react-hook-form';
import { Point } from '@prisma/client';
import PointSelector from './PointSelector';
import AdditionalPoints from '@features/orders/create/inputs/AdditionalPoints';
import RouteMap from '@shared/components/modal/create-client-corp-order/ui/RouteMap';

interface OrderPointsSectionProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  departurePoint: Point | null;
  arrivalPoint: Point | null;
  additionalPoints: (Point | null)[];
  onDepartureSelect: (point: Point | null) => void;
  onArrivalSelect: (point: Point | null) => void;
  onAdditionalSelect: (point: Point, index: number) => void;
  onRemovePoint: (index: number) => void;
  onChangeOrder: (currentIndex: number, newIndex: number) => void;
}

const OrderPointsSection: React.FC<OrderPointsSectionProps> = ({
  control,
  setValue,
  departurePoint,
  arrivalPoint,
  additionalPoints,
  onDepartureSelect,
  onArrivalSelect,
  onAdditionalSelect,
  onRemovePoint,
  onChangeOrder,
}) => {
  // Локальные состояния для селекторов адресов (подачи и прибытия)
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [fromSearchValue, setFromSearchValue] = useState('');
  const [fromSearch, setFromSearch] = useState('');
  const [fromLoading, setFromLoading] = useState(false);
  const [fromFilteredPoints, setFromFilteredPoints] = useState<Point[]>([]);
  const fromSelectorRef = useRef<HTMLDivElement | null>(null);
  const fromObserverRef = useRef<HTMLDivElement | null>(null);

  const [isToOpen, setIsToOpen] = useState(false);
  const [toSearchValue, setToSearchValue] = useState('');
  const [toSearch, setToSearch] = useState('');
  const [toLoading, setToLoading] = useState(false);
  const [toFilteredPoints, setToFilteredPoints] = useState<Point[]>([]);
  const toSelectorRef = useRef<HTMLDivElement | null>(null);
  const toObserverRef = useRef<HTMLDivElement | null>(null);

  // Состояния для дополнительных остановок
  const [isAdditionalOpen, setIsAdditionalOpen] = useState(false);
  const [additionalSearchValue, setAdditionalSearchValue] = useState('');
  const [additionalSearch, setAdditionalSearch] = useState('');
  const [additionalFilteredPoints, setAdditionalFilteredPoints] = useState<Point[]>([]);
  const additionalSelectorRef = useRef<HTMLDivElement | null>(null);

  // Заглушки для поиска точек – здесь можно подключить ваш API
  const searchPoints = useCallback((query: string, setter: (pts: Point[]) => void) => {
    // Например, делаем запрос и обновляем setter (здесь просто заглушка)
    setter([]);
  }, []);

  // Handlers для точки подачи
  const onFromOpenSelect = useCallback(() => setIsFromOpen(true), []);
  const onFromSearchValueChange = useCallback(
    (value: string) => {
      setFromSearchValue(value);
      searchPoints(value, setFromFilteredPoints);
    },
    [searchPoints],
  );
  const handleFromSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFromSearch(e.target.value);
      searchPoints(e.target.value, setFromFilteredPoints);
    },
    [searchPoints],
  );
  const handleDepartureSelectPoint = useCallback(
    (point: Point | null) => {
      onDepartureSelect(point);
      setIsFromOpen(false);
      setFromSearchValue('');
    },
    [onDepartureSelect],
  );

  // Handlers для точки прибытия
  const onToOpenSelect = useCallback(() => setIsToOpen(true), []);
  const onToSearchValueChange = useCallback(
    (value: string) => {
      setToSearchValue(value);
      searchPoints(value, setToFilteredPoints);
    },
    [searchPoints],
  );
  const handleToSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setToSearch(e.target.value);
      searchPoints(e.target.value, setToFilteredPoints);
    },
    [searchPoints],
  );
  const handleArrivalSelectPoint = useCallback(
    (point: Point | null) => {
      onArrivalSelect(point);
      setIsToOpen(false);
      setToSearchValue('');
    },
    [onArrivalSelect],
  );

  // Handlers для дополнительных остановок
  const onAdditionalOpenSelect = useCallback(() => setIsAdditionalOpen(true), []);
  const onAdditionalSearchValueChange = useCallback(
    (value: string) => {
      setAdditionalSearchValue(value);
      searchPoints(value, setAdditionalFilteredPoints);
    },
    [searchPoints],
  );
  const onAdditionalHandleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAdditionalSearch(e.target.value);
      searchPoints(e.target.value, setAdditionalFilteredPoints);
    },
    [searchPoints],
  );
  const onMaxLimitReached = useCallback(() => {
    alert('Достигнут лимит дополнительных остановок');
  }, []);

  // Расчёт дополнительных параметров маршрута (заглушка)
  const routeDuration = '30 мин';
  const routeDistance = 15.5;
  const routeCost = 150;

  // Собираем все точки для карты
  const computedAllPoints: Point[] = [];
  if (departurePoint) computedAllPoints.push(departurePoint);
  if (additionalPoints && additionalPoints.filter(Boolean).length > 0) {
    computedAllPoints.push(...additionalPoints.filter((p): p is Point => p !== null));
  }
  if (arrivalPoint) computedAllPoints.push(arrivalPoint);

  return (
    <div className="flex flex-row gap-4">
      <div className="w-full flex flex-col gap-4 p-4 border-2 rounded-md">
        <PointSelector
          control={control}
          name="departurePoint"
          label="Адрес подачи"
          isOpen={isFromOpen}
          searchValue={fromSearchValue}
          onOpenSelect={onFromOpenSelect}
          onSearchValueChange={onFromSearchValueChange}
          search={fromSearch}
          handleSearchChange={handleFromSearchChange}
          filteredPoints={fromFilteredPoints}
          loading={fromLoading}
          onSelectPoint={handleDepartureSelectPoint}
          selectorRef={fromSelectorRef}
          observerRef={fromObserverRef}
          selectedPoint={departurePoint}
        />
        <PointSelector
          control={control}
          name="arrivalPoint"
          label="Адрес прибытия"
          isOpen={isToOpen}
          searchValue={toSearchValue}
          onOpenSelect={onToOpenSelect}
          onSearchValueChange={onToSearchValueChange}
          search={toSearch}
          handleSearchChange={handleToSearchChange}
          filteredPoints={toFilteredPoints}
          loading={toLoading}
          onSelectPoint={handleArrivalSelectPoint}
          selectorRef={toSelectorRef}
          observerRef={toObserverRef}
          selectedPoint={arrivalPoint}
          arrivalPointPrice={arrivalPoint?.pricePerKm ? Number(arrivalPoint.pricePerKm) : undefined}
        />
        {/* Информация под селекторами */}
        <div className="text-4 rounded-md  border">
          <div className="grid grid-cols-[20px_80px_1fr] gap-y-2 gap-x-4">
            {departurePoint && (
              <>
                <span className="font-semibold text-blue-500">A</span>
                <span className="font-semibold">Откуда:</span>
                <span>{departurePoint.address}</span>
              </>
            )}
            {arrivalPoint && (
              <>
                <span className="font-semibold text-red-500">B</span>
                <span className="font-semibold">Куда:</span>
                <span>{arrivalPoint.address}</span>
              </>
            )}
            {additionalPoints &&
              additionalPoints.some((point) => point !== null) &&
              additionalPoints
                .filter((point): point is Point => point !== null)
                .map((point, index) => (
                  <React.Fragment key={point.uuid}>
                    <span className="font-semibold text-green-500">
                      {String.fromCharCode(67 + index)}
                    </span>
                    <span className="font-semibold">Точка:</span>
                    <span>{point.address}</span>
                  </React.Fragment>
                ))}
            {routeDuration && (
              <>
                <span className="font-semibold text-purple-500">⏱</span>
                <span className="font-semibold">Время:</span>
                <span>{routeDuration}</span>
              </>
            )}
            {routeDistance > 0 && (
              <>
                <span className="font-semibold text-teal-500">📏</span>
                <span className="font-semibold">Км:</span>
                <span>{routeDistance.toFixed(2)} км</span>
              </>
            )}
            {routeCost && (
              <>
                <span className="font-semibold text-orange-500">💸</span>
                <span className="font-semibold">Стоимость маршрута:</span>
                <span>{routeCost.toFixed(2)} сом</span>
              </>
            )}
          </div>
        </div>
      </div>

      <AdditionalPoints
        label="Дополнительные остановки"
        isOpen={isAdditionalOpen}
        searchValue={additionalSearchValue}
        onOpenSelect={onAdditionalOpenSelect}
        onSearchValueChange={onAdditionalSearchValueChange}
        search={additionalSearch}
        handleSearchChange={onAdditionalHandleSearchChange}
        filteredPoints={additionalFilteredPoints}
        onSelectPoint={(point: Point, index?: number) => onAdditionalSelect(point, index ?? 0)}
        selectorRef={additionalSelectorRef}
        selectedPoints={additionalPoints ?? []}
        onRemovePoint={onRemovePoint}
        onChangeOrder={onChangeOrder}
        onMaxLimitReached={onMaxLimitReached}
        totalAdditionalPrice={0}
      />

      <h2 className="text-2xl font-semibold">Интерактивная карта</h2>
      <RouteMap
        allPoints={computedAllPoints}
        selectedPoints={[
          departurePoint ?? null,
          ...(additionalPoints?.filter((p): p is Point => p !== null) ?? []),
          arrivalPoint ?? null,
        ]}
        onPointSelect={(point, isSelected) => {
          // Здесь можно добавить логику выбора точки с карты
        }}
        onDistanceUpdate={(distance) => {
          // Обновление расстояния маршрута
        }}
        onDurationUpdate={(duration) => {
          // Обновление времени маршрута
        }}
      />
    </div>
  );
};

export default OrderPointsSection;
