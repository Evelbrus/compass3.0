import React from 'react';

interface AcceptedStageProps {
  onStartTrip: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const AcceptedStage: React.FC<AcceptedStageProps> = ({ onStartTrip, onCancel, isLoading }) => {
  return (
    <>
      <button
        className={`px-5 py-2 rounded-md text-white transition-colors ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        onClick={onStartTrip}
        disabled={isLoading}
      >
        Еду к клиенту
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

export default AcceptedStage;