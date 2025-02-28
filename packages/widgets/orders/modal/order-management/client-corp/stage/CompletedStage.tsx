import React from 'react';

interface CompletedStageProps {
  onClose: () => void;
}

const CompletedStage: React.FC<CompletedStageProps> = ({ onClose }) => {
  return (
    <div className="flex justify-center mt-6">
      <div className="px-6 py-2 bg-green-500 text-white rounded cursor-default">
        Заказ завершён
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

export default CompletedStage;