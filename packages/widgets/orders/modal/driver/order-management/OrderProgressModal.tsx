import React from 'react';

const OrderProgressModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Работа с заказом</h2>
        <p>
          Здесь будет информация о заказе... а также кнопки для упрвление заказом когда водитель за
          работой
        </p>
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default OrderProgressModal;
