import React from 'react';

interface CancelledStageProps {
  onClose: () => void;
}

const CancelledStage: React.FC<CancelledStageProps> = ({ onClose }) => {
  return (
    <div className="mt-4 flex justify-center">
      <button
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        onClick={onClose}
      >
        Закрыть
      </button>
    </div>
  );
};

export default React.memo(CancelledStage);
