import React from 'react';

const WarningAdminModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Информация о заказе о том что он просрочен</h2>
        <p>
          Здесь будет информация о заказе... 2 кнопки взять заказ или отменить, а также оставшиеся
          время для взятие заказа 10 минут от depurture time
        </p>
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default WarningAdminModal;
