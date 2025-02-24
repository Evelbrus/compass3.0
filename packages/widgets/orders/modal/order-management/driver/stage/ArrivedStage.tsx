import React from 'react';

interface ArrivedStageProps {
  onPickUp: () => void;
  isLoading: boolean;
}

const ArrivedStage: React.FC<ArrivedStageProps> = ({ onPickUp, isLoading }) => {
  return (
    <button
      className={`px-5 py-2 rounded-md text-white transition-colors ${
        isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
      }`}
      onClick={onPickUp}
      disabled={isLoading}
    >
      Начать поездку
    </button>
  );
};

export default ArrivedStage;