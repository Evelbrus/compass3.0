import React from 'react';
import { OrderDetail } from '@widgets/modal/order-management/types/order.types';

interface ClientInfoProps {
  clientBy: NonNullable<OrderDetail['clientBy']>;
}

const ClientInfo: React.FC<ClientInfoProps> = ({ clientBy }) => {
  const cardClass = 'bg-white rounded-xl shadow-sm border border-gray-100 p-4';

  return (
    <div className={cardClass}>
      <h3 className="text-lg font-medium text-gray-800 mb-3">Клиент</h3>
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

        {/* Информация о клиенте */}
        <div>
          <h4 className="font-semibold text-gray-900">{clientBy.fullName}</h4>
          <p className="text-sm text-gray-600">{clientBy.phone}</p>
        </div>

        {/* Кнопка звонка */}
        <a href={`tel:${clientBy.phone}`} className="ml-auto">
          <button
            className="p-2 text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition"
            aria-label={`Позвонить клиенту ${clientBy.fullName}`}
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
    </div>
  );
};

export default React.memo(ClientInfo);
