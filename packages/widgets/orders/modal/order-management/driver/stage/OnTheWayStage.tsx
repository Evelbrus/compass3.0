import React from 'react';

interface OnTheWayStageProps {
  onArrive: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const OnTheWayStage: React.FC<OnTheWayStageProps> = ({ onArrive, onCancel, isLoading }) => {
  return (
    <>
      <button
        className={`px-5 py-2 rounded-md text-white transition-colors ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        onClick={onArrive}
        disabled={isLoading}
      >
        Прибыл к клиенту
      </button>
      <button
        className={`px-5 py-2 rounded-md text-white transition-colors ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
        }`}
        onClick={onCancel}
        disabled={isLoading}
      >
        Отменить заказ
      </button>
    </>
  );
};

export default OnTheWayStage;