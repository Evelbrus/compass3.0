import React from 'react';
import { OrderDetail } from '@widgets/modal/order-management/types/order.types';

interface DriverInfoProps {
  driver: NonNullable<OrderDetail['assignedDriver']>;
}

const DriverInfo: React.FC<DriverInfoProps> = ({ driver }) => {
  const cardClass = 'bg-white rounded-xl shadow-sm border border-gray-100 p-4';

  return (
    <div className={cardClass}>
      <h3 className="text-lg font-medium text-gray-800 mb-3">Ваш водитель</h3>
      <div className="flex items-center">
        {/* Аватар */}
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mr-4 overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Информация о водителе */}
        <div>
          <h4 className="font-semibold text-gray-900">{driver.fullName}</h4>
          <div className="flex items-center text-sm text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-yellow-400 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3 .921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784 .57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81 .588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="mr-2">{driver.rating || '4.8'}</span>
            <span>| {driver.tripsCount || '1500+'} поездок</span>
          </div>
        </div>

        {/* Кнопка звонка */}
        <a href={`tel:${driver.phone}`} className="ml-auto">
          <button
            className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition"
            aria-label={`Позвонить водителю ${driver.fullName}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
        </a>
      </div>

      {/* Информация об автомобиле */}
      {driver.vehicle && (
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          {driver.vehicle.model && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500">Автомобиль</p>
              <p className="font-medium text-gray-900">
                {driver.vehicle.brand} {driver.vehicle.model}
                {driver.vehicle.vehicleType && ` (${driver.vehicle.vehicleType})`}
              </p>
            </div>
          )}
          {driver.vehicle.plateNumber && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500">Госномер</p>
              <p className="font-medium text-gray-900">{driver.vehicle.plateNumber}</p>
            </div>
          )}
          {driver.vehicle.serviceLevels && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500">Класс</p>
              <p className="font-medium text-gray-900">{driver.vehicle.serviceLevels}</p>
            </div>
          )}
          {driver.vehicle.color && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-gray-500">Цвет</p>
              <p className="font-medium text-gray-900">{driver.vehicle.color}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(DriverInfo);
