import React from 'react';

interface WarningStageProps {
  onRedirect: () => void;
}

const WarningStage: React.FC<WarningStageProps> = ({ onRedirect }) => {
  return (
    <div className="mt-4 flex justify-center">
      <button
        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        onClick={onRedirect}
      >
        Перейти к заказу
      </button>
    </div>
  );
};

export default React.memo(WarningStage);
