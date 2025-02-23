import React from 'react';
import { DriverAcceptanceStatus, OrderStatus } from '@prisma/client';

interface CancelOrderStageProps {
  onCancel: () => void;
  isLoading: boolean;
  currentStage: DriverAcceptanceStatus;
  orderStatus: OrderStatus;
}

const CancelOrderStage: React.FC<CancelOrderStageProps> = ({
                                                             onCancel,
                                                             isLoading,
                                                             currentStage,
                                                             orderStatus,
                                                           }) => {
  const canCancel =
    currentStage === DriverAcceptanceStatus.PENDING &&
    orderStatus !== OrderStatus.COMPLETED &&
    orderStatus !== OrderStatus.CANCELLED;

  return (
    <>
      {!canCancel && (
        <p className="text-red-500">Заказ уже принят водителем, отмена невозможна</p>
      )}
      <button
        className={`px-5 py-2 rounded-md text-white transition-colors ${
          isLoading || !canCancel ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
        }`}
        onClick={onCancel}
        disabled={isLoading || !canCancel}
      >
        Отменить заказ
      </button>
    </>
  );
};

export default CancelOrderStage;