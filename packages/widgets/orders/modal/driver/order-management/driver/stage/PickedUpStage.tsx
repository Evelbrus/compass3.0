import React from 'react';

interface PickedUpStageProps {
  onComplete: () => void;
  isLoading: boolean;
}

const PickedUpStage: React.FC<PickedUpStageProps> = ({ onComplete, isLoading }) => {
  return (
    <button
      className={`px-5 py-2 rounded-md text-white transition-colors ${
        isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
      }`}
      onClick={onComplete}
      disabled={isLoading}
    >
      Завершить поездку
    </button>
  );
};

export default PickedUpStage;