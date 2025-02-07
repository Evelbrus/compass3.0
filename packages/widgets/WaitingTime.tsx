import React from 'react';
import { useFormContext } from 'react-hook-form';

interface WaitingTimeProps {
  selectedTariff: any | null;
  handleWaitingTimeIncrement: () => void;
  handleWaitingTimeDecrement: () => void;
  minWaitTime: number;
  points: Point[];
}

interface Point {
  uuid: string;
  airport?: boolean;
}

const WaitingTime: React.FC<WaitingTimeProps> = ({
  selectedTariff,
  handleWaitingTimeIncrement,
  handleWaitingTimeDecrement,
  minWaitTime,
  points,
}) => {
  const { watch } = useFormContext();
  const waitingTimeMinutes = watch().waitingTimeMinutes;
  const departurePointUuid = watch().departurePoint;

  const departurePoint = points?.find((point) => point.uuid === departurePointUuid);
  const isAirport = departurePoint?.airport;

  const freeWaitTime = isAirport
    ? selectedTariff?.freeWaitTimeAirport
    : selectedTariff?.freeWaitTimeBishkek;

  const pricePerMinute = isAirport
    ? selectedTariff?.pricePerMinuteAfterAirport
    : selectedTariff?.pricePerMinuteAfterBishkek;

  if (!selectedTariff) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={'w-full flex flex-col'}>
        <label className="text-lg text-black font-medium">
          Время ожидания {isAirport ? '(аэропорт)' : ''}
        </label>
        <div className={'flex justify-center items-center bg-gray-500 rounded-md p-2'}>
          <button
            onClick={handleWaitingTimeDecrement}
            disabled={waitingTimeMinutes === minWaitTime}
            className="px-2 py-1 rounded-md text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            -
          </button>
          <p className="mx-4 text-lg text-white font-medium">{waitingTimeMinutes} minutes</p>
          <button
            onClick={handleWaitingTimeIncrement}
            disabled={waitingTimeMinutes === 60}
            className="px-2 py-1 rounded-md text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            +
          </button>
        </div>
      </div>
      <div className={'w-full flex flex-col items-center mt-2'}>
        <label className="text-sm text-gray-700 font-medium">
          Бесплатное время ожидания: {freeWaitTime} минут
        </label>
        <label className="text-sm text-gray-700 font-medium">
          Стоимость за каждую дополнительную минуту: {pricePerMinute} сом
        </label>
      </div>
    </div>
  );
};

export default WaitingTime;
