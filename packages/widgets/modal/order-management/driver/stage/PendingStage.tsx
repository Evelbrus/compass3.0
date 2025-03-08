import React from 'react';

interface PendingStageProps {
  onAccept: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const PendingStage: React.FC<PendingStageProps> = ({ onAccept, onCancel, isLoading }) => {
  return (
    <>
      <button
        className={`px-5 py-2 rounded-md text-white transition-colors ${
          isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
        onClick={onAccept}
        disabled={isLoading}
      >
        Принять заказ
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

export default PendingStage;