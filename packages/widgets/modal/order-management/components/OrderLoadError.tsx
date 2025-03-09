import React from 'react';

interface OrderLoadErrorProps {
  message?: string;
}

const OrderLoadError: React.FC<OrderLoadErrorProps> = ({
  message = 'Не удалось загрузить данные заказа',
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-red-500 text-lg font-medium">{message}</p>
      <p className="text-gray-500 mt-2 text-center">
        Попробуйте обновить страницу или обратитесь в службу поддержки
      </p>
    </div>
  );
};

export default React.memo(OrderLoadError);
