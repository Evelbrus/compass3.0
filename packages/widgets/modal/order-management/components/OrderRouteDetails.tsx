import React from 'react';
import {
  formatDateTime,
  getEstimatedArrivalTime,
  formatDuration,
} from '@widgets/modal/order-management/utils/orderUtils';
import { OrderDetail } from '@widgets/modal/order-management/types/order.types';

interface OrderRouteDetailsProps {
  orderData: OrderDetail;
  intermediateAddresses: string[];
}

const OrderRouteDetails: React.FC<OrderRouteDetailsProps> = ({
  orderData,
  intermediateAddresses,
}) => {
  const cardClass = 'bg-white rounded-xl shadow-sm border border-gray-100 p-4';

  return (
    <div className={cardClass}>
      <h3 className="text-lg font-medium text-gray-800 mb-3">Маршрут поездки</h3>
      <div className="space-y-4 relative">
        {/* Точка отправления */}
        <div className="flex">
          <div className="mr-3 relative">
            <div className="w-3 h-3 rounded-full bg-green-500 z-10 relative"></div>
            {(intermediateAddresses.length > 0 || orderData.arrivalPoint) && (
              <div className="absolute top-3 bottom-0 left-1.5 w-0.5 bg-gray-300 -ml-px"></div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{orderData.departurePoint.address}</p>
            <p className="text-sm text-gray-500">
              Отправление: {formatDateTime(orderData.departureTime)}
            </p>
          </div>
        </div>

        {/* Промежуточные остановки */}
        {intermediateAddresses.length > 0 &&
          intermediateAddresses.map((address, index) => (
            <div key={index} className="flex">
              <div className="mr-3 relative">
                <div className="w-3 h-3 rounded-full bg-yellow-500 z-10 relative"></div>
                <div className="absolute top-3 bottom-0 left-1.5 w-0.5 bg-gray-300 -ml-px"></div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{address}</p>
                <p className="text-sm text-gray-500">Промежуточная остановка</p>
              </div>
            </div>
          ))}

        {/* Точка прибытия */}
        <div className="flex">
          <div className="mr-3">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{orderData.arrivalPoint.address}</p>
            <p className="text-sm text-gray-500">
              Прибытие примерно в {getEstimatedArrivalTime(orderData)}
            </p>
          </div>
        </div>
      </div>

      {/* Дополнительная информация о расстоянии и времени */}
      {(orderData.distanceKm || orderData.estimatedDurationMinutes) && (
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm text-gray-500">
          {orderData.distanceKm && <span>Расстояние: ~{orderData.distanceKm.toFixed(1)} км</span>}
          {orderData.estimatedDurationMinutes && (
            <span>Время в пути: {formatDuration(orderData.estimatedDurationMinutes)}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(OrderRouteDetails);
