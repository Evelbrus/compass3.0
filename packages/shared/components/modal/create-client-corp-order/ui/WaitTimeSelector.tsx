import React from 'react';
import { Point } from '@prisma/client';

interface WaitTimeSelectorProps {
  waitTime: number;
  additionalWaitTimeCost: number;
  adjustWaitTime: (increment: number) => void;
  minWaitTime: number;
  maxWaitTime: number;
  departurePoint?: Point | null | undefined;
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
    <div className="w-1/2 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {isAirport
          ? `Время ожидания в аэропорту ${departurePoint?.address || ''}`
          : 'Время ожидания'}
        <div className="flex items-center gap-4">
          <div className="w-1/2 flex flex-row justify-between items-center rounded-md p-2 bg-gray-300">
            <button
              type="button"
              onClick={() => adjustWaitTime(-5)}
              disabled={waitTime <= minWaitTime}
              className="flex px-2 py-1 rounded-md bg-gray-400 hover:bg-gray-500"
            >
              -5
            </button>
            <span>{waitTime} мин</span>
            <button
              type="button"
              onClick={() => adjustWaitTime(5)}
              disabled={waitTime >= maxWaitTime}
              className="flex px-2 py-1 rounded-md bg-gray-400 hover:bg-gray-500"
            >
              +5
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          {freeWaitTime > 0 && (
            <>
              Бесплатное время ожидания: <b>{freeWaitTime} мин</b>
              <br />
            </>
          )}
          Стоимость дополнительного ожидания: <b>{additionalWaitTimeCost}</b>
        </p>
      </div>
    </div>
  );
};

export default WaitTimeSelector;
