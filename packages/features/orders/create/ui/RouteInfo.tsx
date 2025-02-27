import React, { FC, useMemo } from 'react';
import { Control, Controller } from 'react-hook-form';
import Decimal from 'decimal.js';
import { PointWithoutTimestamps } from '@features/orders/create/hooks/points/useAllPoints';
import { cn } from '@shared/lib';
import { OrderStatus } from '@prisma/client';
import { orderStatusTranslations } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';

interface RouteInfoProps {
  control: Control<FormOrderValues>;
  departurePoint: PointWithoutTimestamps | null;
  additionalPoints: (PointWithoutTimestamps | null)[];
  arrivalPoint: PointWithoutTimestamps | null;
  routeDuration: string | null;
  routeDistance: number;
  totalPrice: Decimal;
  tariffPrice?: Decimal | null;
  additionalServicesPrice?: Decimal | null;
  waitTimeCost?: Decimal | null;
  routeCost?: Decimal | null;
  basePrice?: Decimal | null;
  mode?: 'create' | 'edit';
  selectedDriverInfo?: any;
  handleEditPrice?: (price: number) => void;
  resetPrice?: () => void;
  onStatusChange?: (status: OrderStatus) => void;
}

const RouteInfo: FC<RouteInfoProps> = ({
  control,
  departurePoint,
  additionalPoints,
  arrivalPoint,
  routeDuration,
  routeDistance,
  totalPrice,
  tariffPrice,
  additionalServicesPrice,
  waitTimeCost,
  routeCost,
  basePrice,
  mode = 'create',
  selectedDriverInfo,
  handleEditPrice,
  resetPrice,
  onStatusChange,
}) => {
  const filteredAdditionalPoints = useMemo(
    () => additionalPoints.filter((point): point is PointWithoutTimestamps => point !== null),
    [additionalPoints],
  );

  const totalPointsCount = useMemo(
    () => [departurePoint, ...filteredAdditionalPoints, arrivalPoint].filter(Boolean).length,
    [departurePoint, filteredAdditionalPoints, arrivalPoint],
  );

  const formattedPrices = useMemo(() => {
    return {
      total: totalPrice ? totalPrice.toNumber().toString() : '0',
      tariff: tariffPrice ? tariffPrice.toNumber().toString() : '0',
      additionalServices: additionalServicesPrice
        ? additionalServicesPrice.toNumber().toString()
        : '0',
      waitTime: waitTimeCost ? waitTimeCost.toNumber().toString() : '0',
      route: routeCost ? routeCost.toNumber().toString() : '0',
    };
  }, [totalPrice, tariffPrice, additionalServicesPrice, waitTimeCost, routeCost]);

  const currentStatus =
    mode === 'create'
      ? selectedDriverInfo
        ? OrderStatus.PLANNED
        : OrderStatus.PENDING
      : undefined;

  const getStatusColor = (orderStatus: OrderStatus) => {
    switch (orderStatus) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'PLANNED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'OVERDUE':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const routeSegmentPrices = useMemo(() => {
    const segments: {
      from: string;
      to: string;
      distance: string;
      pricePerKm: number;
      terrainDifficulty: number;
      cost: number;
    }[] = [];

    if (!departurePoint || !routeDistance) return segments;

    const allPoints = [departurePoint, ...filteredAdditionalPoints, arrivalPoint].filter(Boolean);

    if (allPoints.length < 2) return segments;

    const segmentCount = allPoints.length - 1;
    const avgDistancePerSegment = routeDistance / segmentCount;

    for (let i = 0; i < segmentCount; i++) {
      const fromPoint = allPoints[i];
      const toPoint = allPoints[i + 1];

      if (!fromPoint || !toPoint) continue;

      const segmentDistance = avgDistancePerSegment;
      const pricePerKm = Number(fromPoint.pricePerKm);
      const terrainDifficulty = Number(fromPoint.terrainDifficulty) || 1;
      const segmentCost = Math.round(segmentDistance * pricePerKm * terrainDifficulty);

      segments.push({
        from: fromPoint.address,
        to: toPoint.address,
        distance: segmentDistance.toFixed(2),
        pricePerKm,
        terrainDifficulty,
        cost: segmentCost,
      });
    }

    return segments;
  }, [departurePoint, arrivalPoint, filteredAdditionalPoints, routeDistance]);

  const isBasePrice = !!basePrice;
  const isPriceManuallyChanged = useMemo(() => {
    if (isBasePrice) return false;
    const sum = routeCost
      ?.plus(tariffPrice || 0)
      .plus(waitTimeCost || 0)
      .plus(additionalServicesPrice || 0);
    return sum && !totalPrice.equals(sum);
  }, [totalPrice, routeCost, tariffPrice, waitTimeCost, additionalServicesPrice, isBasePrice]);

  return (
    <div className="relative w-full rounded-lg border shadow-sm">
      <div className="flex flex-row">
        {/* Блок "Маршрут" */}
        <div className="p-5 flex-1">
          <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
            Маршрут
            <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
          </h3>
          <div className="relative">
            <div className="absolute left-4 top-2 w-0.5 h-[calc(100%-4px)] bg-gradient-to-b from-blue-400 via-green-400 to-red-400"></div>
            <div className="space-y-3 relative">
              {departurePoint && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold shadow-md z-10">
                    A
                  </div>
                  <div className="flex-1 rounded-md p-2 shadow-sm">
                    <div className="text-sm text-blue-600 font-semibold">Откуда</div>
                    <div className="font-medium">{departurePoint.address}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Number(departurePoint.pricePerKm)} сом/км
                      {departurePoint.terrainDifficulty !== 1 && (
                        <span className="ml-2">
                          · Коэф. сложности: {departurePoint.terrainDifficulty}
                        </span>
                      )}
                      {departurePoint.airport && (
                        <span className="ml-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                          Аэропорт
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {filteredAdditionalPoints.map((point, index) => {
                const letter = String.fromCharCode(67 + index); // C, D, E...
                const bgColors = [
                  'bg-green-500',
                  'bg-purple-500',
                  'bg-orange-500',
                  'bg-cyan-500',
                  'bg-pink-500',
                ];

                return (
                  <div key={point.uuid} className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        bgColors[index % bgColors.length]
                      } text-white font-bold shadow-md z-10`}
                    >
                      {letter}
                    </div>
                    <div className="flex-1 rounded-md p-2 shadow-sm">
                      <div className="text-xs font-semibold">Промежуточная точка {index + 1}</div>
                      <div className="font-medium">{point.address}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {Number(point.pricePerKm)} сом/км
                        {point.terrainDifficulty !== 1 && (
                          <span className="ml-2">· Коэф. сложности: {point.terrainDifficulty}</span>
                        )}
                        {point.airport && (
                          <span className="ml-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                            Аэропорт
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {arrivalPoint && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold shadow-md z-10">
                    B
                  </div>
                  <div className="flex-1 rounded-md p-2 shadow-sm">
                    <div className="text-sm text-red-600 font-semibold">Куда</div>
                    <div className="font-medium">{arrivalPoint.address}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Number(arrivalPoint.pricePerKm)} сом/км
                      {arrivalPoint.terrainDifficulty !== 1 && (
                        <span className="ml-2">
                          · Коэф. сложности: {arrivalPoint.terrainDifficulty}
                        </span>
                      )}
                      {arrivalPoint.airport && (
                        <span className="ml-2 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                          Аэропорт
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Блок "Сведения" */}
        <div className="p-5 flex-1">
          <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
            Сведения
            <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
          </h3>
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center w-10 h-10">
                <span className="text-lg">⏱</span>
              </div>
              <div>
                <div className="text-sm text-gray-500">Время в пути</div>
                <div className="font-bold text-lg">
                  {routeDuration ? routeDuration : 'Рассчитывается...'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center w-10 h-10">
                <span className="text-lg">📏</span>
              </div>
              <div>
                <div className="text-sm text-gray-500">Расстояние</div>
                <div className="font-bold text-lg">
                  {routeDistance > 0 ? `${routeDistance.toFixed(2)} км` : 'Рассчитывается...'}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center w-10 h-10">
                <span className="text-lg">📍</span>
              </div>
              <div>
                <div className="text-sm text-gray-500">Количество точек</div>
                <div className="font-bold text-lg">{totalPointsCount}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center w-10 h-10">
                <span className="text-lg">🚩</span>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Статус заказа</div>
                {mode === 'edit' ? (
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (onStatusChange) onStatusChange(e.target.value as OrderStatus);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500"
                      >
                        {Object.entries(orderStatusTranslations).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                ) : (
                  <div
                    className={cn(
                      'inline-block px-3 py-1 rounded-full text-sm font-medium border',
                      getStatusColor(currentStatus as OrderStatus),
                    )}
                  >
                    {orderStatusTranslations[currentStatus as OrderStatus]}
                  </div>
                )}
              </div>
            </div>
            {routeSegmentPrices.length > 0 && (
              <div className="mt-4">
                <div className="space-y-2 mt-2 max-h-64 overflow-y-auto pr-2">
                  {routeSegmentPrices.map((segment, idx) => (
                    <div
                      key={idx}
                      className="text-xs border border-gray-200 rounded-md p-2 bg-gray-50"
                    >
                      <div className="font-medium mb-1 text-blue-700">
                        {segment.from} → {segment.to}
                      </div>
                      <div className="text-gray-600">
                        <span className="font-semibold">{segment.distance} км</span> ×
                        <span className="font-semibold"> {segment.pricePerKm} сом/км</span>
                        {segment.terrainDifficulty !== 1 && (
                          <span>
                            {' '}
                            × <span className="font-semibold">
                              {segment.terrainDifficulty}
                            </span>{' '}
                            (коэф. сложности)
                          </span>
                        )}{' '}
                        ={' '}
                        <span className="font-semibold text-blue-700 ml-1">{segment.cost} сом</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold border-t pt-2 text-blue-700">
                    <span>Итоговая стоимость маршрута:</span>
                    <span>{formattedPrices.route} сом</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Блок "Расчет стоимости" */}
        <div className="p-5 flex-1">
          <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
            Расчет стоимости
            <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
              <span className="text-gray-700">Базовый тариф:</span>
              <span className="font-semibold">{formattedPrices.tariff} сом</span>
            </div>
            <div className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
              <span className="text-gray-700">Стоимость маршрута:</span>
              <span className="font-semibold">{formattedPrices.route} сом</span>
            </div>
            <div className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
              <span className="text-gray-700">Стоимость ожидания:</span>
              <span className="font-semibold">{formattedPrices.waitTime} сом</span>
            </div>
            <div className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
              <span className="text-gray-700">Доп. услуги:</span>
              <span className="font-semibold">{formattedPrices.additionalServices} сом</span>
            </div>
            <div className="flex justify-between items-center text-base font-bold pt-3 mt-3 border-t">
              <span>
                {isBasePrice
                  ? 'Общая сумма (базовая):'
                  : isPriceManuallyChanged
                    ? 'Общая сумма (изменена вручную):'
                    : 'Общая сумма:'}
              </span>
              <span className="text-lg text-blue-700">{formattedPrices.total} сом</span>
            </div>
          </div>
          {mode === 'edit' && handleEditPrice && resetPrice && (
            <div className="mt-4 border-t pt-4">
              <div className="text-sm text-gray-500 mb-2">Управление ценой</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newPrice = prompt('Введите новую цену:', formattedPrices.total);
                    if (newPrice && !isNaN(Number(newPrice))) {
                      handleEditPrice(Number(newPrice));
                    }
                  }}
                  className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Изменить цену
                </button>
                <button
                  type="button"
                  onClick={resetPrice}
                  className="flex-1 py-2 px-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
                >
                  Сбросить
                </button>
              </div>
              {isPriceManuallyChanged && !isBasePrice && (
                <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  Внимание: цена была изменена вручную и отличается от рассчитанной системой.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteInfo;
