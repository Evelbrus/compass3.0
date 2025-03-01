import React, { FC, useMemo } from 'react';
import { Control, Controller } from 'react-hook-form';
import Decimal from 'decimal.js';
import { cn } from '@shared/lib';
import { OrderStatus } from '@prisma/client';
import { orderStatusTranslations } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { PointWithoutTimestamps } from '@features/orders/create/types/types';

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
  mode?: 'create' | 'edit';
  selectedDriverInfo?: any;
  handleEditPrice?: (price: number) => void;
  resetPrice?: () => void;
  onStatusChange?: (status: OrderStatus) => void;
  priceMode?: 'base' | 'manual' | 'auto';
  isPriceEdited?: boolean;
}

export const RouteInfo: FC<RouteInfoProps> = ({
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
  mode = 'create',
  selectedDriverInfo,
  handleEditPrice,
  resetPrice,
  onStatusChange,
  priceMode,
  isPriceEdited,
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 border rounded-lg shadow-sm">
      {/* Блок "Маршрут" */}
      <div className="flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
          Маршрут
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
        </h3>
        <div className="relative flex-1">
          <div className="absolute left-4 top-2 w-0.5 h-[calc(100%-8px)] bg-gradient-to-b from-blue-400 via-green-400 to-red-400"></div>
          <div className="space-y-4 relative">
            {departurePoint && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold shadow-md z-10">
                  A
                </div>
                <div className="flex-1 rounded-md p-3 border border-blue-100 shadow-sm bg-blue-50">
                  <div className="text-sm text-blue-600 font-semibold">Откуда</div>
                  <div className="font-medium">{departurePoint.address}</div>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                    <span className="bg-white px-2 py-0.5 rounded-full border border-blue-100">
                      {Number(departurePoint.pricePerKm)} сом/км
                    </span>
                    {departurePoint.terrainDifficulty !== 1 && (
                      <span className="bg-white px-2 py-0.5 rounded-full border border-orange-100 text-orange-600">
                        Коэф. сложности: {departurePoint.terrainDifficulty}
                      </span>
                    )}
                    {departurePoint.airport && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
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
                'from-green-500 to-green-600',
                'from-purple-500 to-purple-600',
                'from-orange-500 to-orange-600',
                'from-cyan-500 to-cyan-600',
                'from-pink-500 to-pink-600',
              ];
              const borderColors = [
                'border-green-100',
                'border-purple-100',
                'border-orange-100',
                'border-cyan-100',
                'border-pink-100',
              ];
              const bgLight = [
                'bg-green-50',
                'bg-purple-50',
                'bg-orange-50',
                'bg-cyan-50',
                'bg-pink-50',
              ];

              return (
                <div key={point.uuid} className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${
                      bgColors[index % bgColors.length]
                    } text-white font-bold shadow-md z-10`}
                  >
                    {letter}
                  </div>
                  <div
                    className={`flex-1 rounded-md p-3 border ${borderColors[index % borderColors.length]} shadow-sm ${bgLight[index % bgLight.length]}`}
                  >
                    <div className="text-xs font-semibold">Промежуточная точка {index + 1}</div>
                    <div className="font-medium">{point.address}</div>
                    <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                      <span className="bg-white px-2 py-0.5 rounded-full border border-gray-100">
                        {Number(point.pricePerKm)} сом/км
                      </span>
                      {point.terrainDifficulty !== 1 && (
                        <span className="bg-white px-2 py-0.5 rounded-full border border-orange-100 text-orange-600">
                          Коэф. сложности: {point.terrainDifficulty}
                        </span>
                      )}
                      {point.airport && (
                        <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
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
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-md z-10">
                  B
                </div>
                <div className="flex-1 rounded-md p-3 border border-red-100 shadow-sm bg-red-50">
                  <div className="text-sm text-red-600 font-semibold">Куда</div>
                  <div className="font-medium">{arrivalPoint.address}</div>
                  <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2">
                    <span className="bg-white px-2 py-0.5 rounded-full border border-red-100">
                      {Number(arrivalPoint.pricePerKm)} сом/км
                    </span>
                    {arrivalPoint.terrainDifficulty !== 1 && (
                      <span className="bg-white px-2 py-0.5 rounded-full border border-orange-100 text-orange-600">
                        Коэф. сложности: {arrivalPoint.terrainDifficulty}
                      </span>
                    )}
                    {arrivalPoint.airport && (
                      <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
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
      <div className="flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
          Сведения
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
        </h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 border border-purple-100 rounded-lg shadow-sm bg-purple-50">
            <div className="p-2 rounded-full bg-white text-purple-600 flex items-center justify-center w-10 h-10 shadow-sm">
              <span className="text-lg">⏱</span>
            </div>
            <div>
              <div className="text-sm text-gray-600">Время в пути</div>
              <div className="font-bold text-lg text-purple-700">
                {routeDuration ? routeDuration : 'Рассчитывается...'}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 border border-teal-100 rounded-lg shadow-sm bg-teal-50">
            <div className="p-2 rounded-full bg-white text-teal-600 flex items-center justify-center w-10 h-10 shadow-sm">
              <span className="text-lg">📏</span>
            </div>
            <div>
              <div className="text-sm text-gray-600">Расстояние</div>
              <div className="font-bold text-lg text-teal-700">
                {routeDistance > 0 ? `${routeDistance.toFixed(2)} км` : 'Рассчитывается...'}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 border border-amber-100 rounded-lg shadow-sm bg-amber-50">
            <div className="p-2 rounded-full bg-white text-amber-600 flex items-center justify-center w-10 h-10 shadow-sm">
              <span className="text-lg">📍</span>
            </div>
            <div>
              <div className="text-sm text-gray-600">Количество точек</div>
              <div className="font-bold text-lg text-amber-700">{totalPointsCount}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 border border-blue-100 rounded-lg shadow-sm bg-blue-50">
            <div className="p-2 rounded-full bg-white text-blue-600 flex items-center justify-center w-10 h-10 shadow-sm">
              <span className="text-lg">🚩</span>
            </div>
            <div className="w-full">
              <div className="text-sm text-gray-600 mb-2">Статус заказа</div>
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
                      className="w-full p-2 border border-blue-200 rounded-md shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-500 bg-white"
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
            <div className="border border-blue-100 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-white p-3 border-b border-blue-100">
                <h4 className="font-semibold text-blue-700">Детализация маршрута</h4>
              </div>
              <div className="p-3 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {routeSegmentPrices.map((segment, idx) => (
                    <div
                      key={idx}
                      className="text-xs border border-gray-200 rounded-md p-2 bg-gray-50 hover:bg-white transition-colors"
                    >
                      <div className="font-medium mb-1 text-blue-700">
                        {segment.from} → {segment.to}
                      </div>
                      <div className="text-gray-600 flex flex-wrap gap-1 items-center">
                        <span className="bg-white px-2 py-0.5 rounded-full border border-blue-100 font-semibold">
                          {segment.distance} км
                        </span>
                        <span>×</span>
                        <span className="bg-white px-2 py-0.5 rounded-full border border-blue-100 font-semibold">
                          {segment.pricePerKm} сом/км
                        </span>
                        {segment.terrainDifficulty !== 1 && (
                          <>
                            <span>×</span>
                            <span className="bg-white px-2 py-0.5 rounded-full border border-orange-100 text-orange-600 font-semibold">
                              {segment.terrainDifficulty}
                            </span>
                            <span className="text-gray-500">(коэф. сложности)</span>
                          </>
                        )}
                        <span>=</span>
                        <span className="bg-blue-100 px-2 py-0.5 rounded-full text-blue-700 font-semibold">
                          {segment.cost} сом
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t border-blue-100 text-blue-700">
                  <span>Итоговая стоимость маршрута:</span>
                  <span>{formattedPrices.route} сом</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Блок "Расчет стоимости" */}
      <div className="flex flex-col">
        <h3 className="text-xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
          Расчет стоимости
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
        </h3>
        <div className="border border-blue-100 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-white p-3 border-b border-blue-100">
            <h4 className="font-semibold text-blue-700">Составляющие цены</h4>
          </div>
          <div className="p-3">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm p-2 hover:bg-blue-50 rounded transition-colors">
                <span className="text-gray-700">Базовый тариф:</span>
                <span className="font-semibold text-blue-700">{formattedPrices.tariff} сом</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 hover:bg-blue-50 rounded transition-colors">
                <span className="text-gray-700">Стоимость маршрута:</span>
                <span className="font-semibold text-blue-700">{formattedPrices.route} сом</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 hover:bg-blue-50 rounded transition-colors">
                <span className="text-gray-700">Стоимость ожидания:</span>
                <span className="font-semibold text-blue-700">{formattedPrices.waitTime} сом</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 hover:bg-blue-50 rounded transition-colors">
                <span className="text-gray-700">Доп. услуги:</span>
                <span className="font-semibold text-blue-700">
                  {formattedPrices.additionalServices} сом
                </span>
              </div>
              <div className="flex justify-between items-center text-base font-bold pt-3 mt-3 border-t border-blue-100 p-2 bg-gradient-to-r from-blue-50 to-white">
                <span className="text-blue-800">
                  {priceMode === 'base' && isPriceEdited
                    ? 'Общая сумма (сохраненная цена заказа):'
                    : priceMode === 'manual' && isPriceEdited
                      ? 'Общая сумма (изменена вручную):'
                      : 'Общая сумма:'}
                </span>
                <span className="text-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
                  {formattedPrices.total} сом
                </span>
              </div>
            </div>
          </div>
        </div>

        {handleEditPrice && resetPrice && (
          <div className="mt-4 border border-blue-100 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-white p-3 border-b border-blue-100">
              <h4 className="font-semibold text-blue-700">Управление ценой</h4>
            </div>
            <div className="p-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newPrice = prompt('Введите новую цену:', formattedPrices.total);
                    if (newPrice && !isNaN(Number(newPrice))) {
                      handleEditPrice(Number(newPrice));
                    }
                  }}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-md hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm"
                >
                  Изменить цену
                </button>
                <button
                  type="button"
                  onClick={resetPrice}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-md hover:from-gray-600 hover:to-gray-700 transition-all shadow-sm"
                >
                  Сбросить к расчетной
                </button>
              </div>

              {/* Показываем информацию только если цена действительно отличается от расчетной */}
              {priceMode === 'base' && isPriceEdited && (
                <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-100">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      Вы используете сохраненную цену из заказа, которая отличается от расчетной.
                      Нажмите "Сбросить к расчетной", чтобы использовать автоматический расчет.
                    </span>
                  </div>
                </div>
              )}

              {priceMode === 'manual' && isPriceEdited && (
                <div className="mt-2 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>
                      Цена была изменена вручную и отличается от рассчитанной системой. Нажмите
                      "Сбросить к расчетной", чтобы вернуться к автоматическому расчету.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
