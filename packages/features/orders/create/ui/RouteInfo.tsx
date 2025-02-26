import React, { FC } from 'react';
import { Point } from '@prisma/client';

// Определяем тип PointWithoutTimestamps, как в других местах
type PointWithoutTimestamps = Pick<
  Point,
  'uuid' | 'address' | 'pricePerKm' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
>;

interface RouteInfoProps {
  departurePoint: PointWithoutTimestamps | null; // Обновили тип
  additionalPoints: (PointWithoutTimestamps | null)[]; // Обновили тип
  arrivalPoint: PointWithoutTimestamps | null; // Обновили тип
  routeDuration: string | null;
  routeDistance: number;
}

const RouteInfo: FC<RouteInfoProps> = ({
                                         departurePoint,
                                         additionalPoints,
                                         arrivalPoint,
                                         routeDuration,
                                         routeDistance,
                                       }) => {
  return (
    <div className="relative w-full rounded-lg border">
      <div className="bg-gradient-to-b from-blue-900/10 to-transparent p-5 rounded-lg">
        <h3 className="text-5 font-extrabold mb-4 relative z-10 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
          Информация о маршруте
          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-transparent rounded-full mt-1"></div>
        </h3>

        {/* Точки маршрута */}
        <div className="mb-4 relative z-10">
          <h4 className="text-4 font-medium mb-2">Маршрут:</h4>

          {/* Соединительная линия между точками */}
          <div className="absolute left-4 top-12 w-0.5 h-[calc(100%-24px)] bg-gradient-to-b from-blue-400 via-green-400 to-red-400"></div>

          <div className="space-y-3 relative">
            {departurePoint && (
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold shadow-md z-10">
                  A
                </div>
                <div className="flex-1 rounded-md p-2 shadow-sm">
                  <div className="text-3 text-blue-600 font-semibold">Откуда</div>
                  <div className="font-medium">{departurePoint.address}</div>
                </div>
              </div>
            )}

            {additionalPoints &&
              additionalPoints
                .filter((point): point is PointWithoutTimestamps => point !== null) // Обновили тип в type guard
                .map((point, index) => {
                  const letter = String.fromCharCode(67 + index); // C, D, E...
                  const bgColors = [
                    'bg-green-500',
                    'bg-purple-500',
                    'bg-orange-500',
                    'bg-cyan-500',
                    'bg-pink-500',
                  ];
                  const textColors = [
                    'text-green-600',
                    'text-purple-600',
                    'text-orange-600',
                    'text-cyan-600',
                    'text-pink-600',
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
                        <div className={`text-xs font-semibold`}>
                          Промежуточная точка {index + 1}
                        </div>
                        <div className="font-medium">{point.address}</div>
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
                  <div className="text-3 text-red-600 font-semibold">Куда</div>
                  <div className="font-medium">{arrivalPoint.address}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Разделитель */}
      <div className="border-t my-4"></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Изменяем условие для проверки времени в пути */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center w-10 h-10">
            <span className="text-lg">⏱</span>
          </div>
          <div>
            <div className="text-xs text-gray-500">Время в пути</div>
            <div className="font-medium">{routeDuration ? routeDuration : 'Рассчитывается...'}</div>
          </div>
        </div>

        {/* Изменяем условие для проверки расстояния */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center w-10 h-10">
            <span className="text-lg">📏</span>
          </div>
          <div>
            <div className="text-xs text-gray-500">Расстояние</div>
            <div className="font-medium">
              {routeDistance > 0 ? `${routeDistance.toFixed(2)} км` : 'Рассчитывается...'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteInfo;