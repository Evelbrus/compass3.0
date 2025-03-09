import React from 'react';
import { DriverAcceptanceStatus } from '@prisma/client';
import { stages } from '@features/notifications/lib/useNotifications';
import {
  getStageIcon,
  getStageIndex,
  getEstimatedArrivalTime,
} from '@widgets/modal/order-management/utils/orderUtils';
import { OrderDetail } from '@widgets/modal/order-management/types/order.types';

interface OrderStageHeaderProps {
  currentStage: DriverAcceptanceStatus;
  orderData: OrderDetail;
}

const OrderStageHeader: React.FC<OrderStageHeaderProps> = ({ currentStage, orderData }) => {
  return (
    <div className="p-5 bg-gradient-to-b from-blue-50 to-white border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-500 text-white p-2 rounded-lg mr-3">
            {getStageIcon(currentStage)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{stages[currentStage]}</h3>
            <p className="text-sm text-gray-500">
              {currentStage === DriverAcceptanceStatus.ON_THE_WAY &&
                `Ожидаемое время прибытия: ${getEstimatedArrivalTime(orderData)}`}
            </p>
          </div>
        </div>
        <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          {getStageIndex(currentStage)}/7
        </span>
      </div>
    </div>
  );
};

export default React.memo(OrderStageHeader);
