import React from 'react';

interface OrderNotesProps {
  description: string;
}

const OrderNotes: React.FC<OrderNotesProps> = ({ description }) => {
  const cardClass = 'bg-white rounded-xl shadow-sm border border-gray-100 p-4';

  return (
    <div className={cardClass}>
      <h3 className="text-lg font-medium text-gray-800 mb-2">Заметки к заказу</h3>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

export default React.memo(OrderNotes);
