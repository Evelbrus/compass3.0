import React, { useMemo, useCallback } from 'react';

interface WaitingTimeControlProps {
  waitingTimeMinutes: number;
  freeWaitTime: number | undefined;
  handleWaitingTimeChange: (newTime: number) => void;
}

const WaitingTimeControl: React.FC<WaitingTimeControlProps> = ({
  waitingTimeMinutes,
  freeWaitTime,
  handleWaitingTimeChange,
}) => {
  const maxWaitingTime = 60;

  const isDecrementDisabled = useMemo(() => {
    return freeWaitTime !== undefined && waitingTimeMinutes <= (freeWaitTime ?? 0);
  }, [waitingTimeMinutes, freeWaitTime]);

  const isIncrementDisabled = useMemo(() => {
    return maxWaitingTime !== undefined && waitingTimeMinutes >= maxWaitingTime;
  }, [waitingTimeMinutes, maxWaitingTime]);

  const handleDecrement = useCallback(() => {
    if (!isDecrementDisabled) {
      const newTime = Math.max(freeWaitTime ?? 0, waitingTimeMinutes - 5);
      handleWaitingTimeChange(newTime);
    }
  }, [isDecrementDisabled, waitingTimeMinutes, freeWaitTime, handleWaitingTimeChange]);

  const handleIncrement = useCallback(() => {
    if (!isIncrementDisabled) {
      handleWaitingTimeChange(waitingTimeMinutes + 5);
    }
  }, [isIncrementDisabled, waitingTimeMinutes, handleWaitingTimeChange]);

  return (
    <div className={`flex flex-col gap-2 items-start`}>
      <h2 className={'text-4 leading-4 font-medium font-helvetica-neue text-gray-500'}>
        Время ожидания клиента
      </h2>
      <div className={'w-full flex flex-col'}>
        <div className="w-full flex justify-between items-center bg-[#2A3037] rounded-md">
          <button
            onClick={handleDecrement}
            disabled={isDecrementDisabled}
            className="p-1 m-1 w-[40px] h-[40px] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:text-black hover:bg-blue-200"
          >
            -
          </button>
          <div className="px-6 py-2 text-white text-lg font-medium">{waitingTimeMinutes} минут</div>
          <button
            onClick={handleIncrement}
            disabled={isIncrementDisabled}
            className="p-1 m-1 w-[40px] h-[40px] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:text-black hover:bg-blue-200"
          >
            +
          </button>
        </div>
        <span className="w-full flex justify-start text-sm text-gray-500">
          Бесплатное время ожидания: {freeWaitTime !== undefined ? freeWaitTime : '0'} минут
        </span>
      </div>
    </div>
  );
};

export default WaitingTimeControl;
