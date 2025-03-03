import React from 'react';
import { Point } from '@prisma/client';

// Определяем тип PointWithoutTimestamps, как в других местах
type PointWithoutTimestamps = Pick<
  Point,
  'uuid' | 'address' | 'pricePerKm' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
>;

interface WaitTimeSelectorProps {
  waitTime: number;
  additionalWaitTimeCost: number;
  adjustWaitTime: (increment: number) => void;
  minWaitTime: number;
  maxWaitTime: number;
  departurePoint?: PointWithoutTimestamps | null | undefined; // Обновили тип
  freeWaitTime: number;
}

const WaitTimeSelector: React.FC<WaitTimeSelectorProps> = ({
  waitTime,
  additionalWaitTimeCost,
  adjustWaitTime,
  minWaitTime,
  maxWaitTime,
  departurePoint,
  freeWaitTime,
}) => {
  const isAirport = departurePoint?.airport === true;

  return (
    <div className="w-full flex flex-col gap-4 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
          {isAirport
            ? `Время ожидания в аэропорту ${departurePoint?.address || ''}`
            : 'Время ожидания'}
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
        </h3>

        <div className="flex items-center gap-4">
          <div className="w-full flex flex-row justify-between items-center rounded-md">
            <button
              type="button"
              onClick={() => adjustWaitTime(-5)}
              disabled={waitTime <= minWaitTime}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-cyan-100 transition-colors focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -5
            </button>

            <div className="flex-1 mx-4">
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${(waitTime / maxWaitTime) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>{minWaitTime} мин</span>
                <span className="font-medium text-blue-600 text-sm">{waitTime} мин</span>
                <span>{maxWaitTime} мин</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => adjustWaitTime(5)}
              disabled={waitTime >= maxWaitTime}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 hover:bg-cyan-100 transition-colors focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +5
            </button>
          </div>
        </div>

        {isAirport && freeWaitTime > 0 && (
          <div className="flex items-center mt-2 text-blue-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Бесплатное время ожидания в аэропорту:{' '}
            <span className="font-bold ml-1">{freeWaitTime} мин</span>
          </div>
        )}

        <div className="flex justify-between items-center mt-2 py-2 px-3 bg-gray-50 rounded-md">
          <span className="text-gray-700">Стоимость дополнительного ожидания:</span>
          <span className="font-bold text-blue-600">{additionalWaitTimeCost}С</span>
        </div>
      </div>
    </div>
  );
};

export default WaitTimeSelector;
