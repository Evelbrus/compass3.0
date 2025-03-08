import React from 'react';

const CompletedStage: React.FC = () => {
  return (
    <div className="flex justify-center mt-6">
      <div className="px-6 py-2 bg-green-500 text-white rounded cursor-default">
        Заказ завершён
      </div>
    </div>
  );
};

export default CompletedStage;