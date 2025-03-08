import React from 'react';

interface CancelOrderStageProps {
  onCancel: () => void;
  isLoading: boolean;
  currentStage: string; // Оставляем тип для совместимости, но не используем в логике
  orderStatus: string; // То же самое
}

const CancelOrderStage: React.FC<CancelOrderStageProps> = ({ onCancel, isLoading }) => {
  return (
    <button
      className={`px-5 py-2 rounded-md text-white transition-colors ${
        isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
      }`}
      onClick={onCancel}
      disabled={isLoading}
    >
      Отменить заказ
    </button>
  );
};

export default CancelOrderStage;
