import React from 'react';

interface CancelledStageProps {
  onClose: () => void;
  orderId: string;
}

const CancelledStage: React.FC<CancelledStageProps> = ({ onClose, orderId }) => {
  return (
    <div className="flex justify-center mt-6">
      <div className="px-6 py-2 bg-red-500 text-white rounded cursor-default">
        Заказ #{orderId} отменён {/* Используем orderId */}
      </div>
      <button
        className="ml-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        onClick={onClose}
      >
        Закрыть
      </button>
    </div>
  );
};

export default CancelledStage;