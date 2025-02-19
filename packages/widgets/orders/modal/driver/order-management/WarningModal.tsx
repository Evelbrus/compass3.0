import React from 'react';

const WarningModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Информация о заказе о просрочном то что его не взял водитель</h2>
        <p>
          Здесь будет информация о заказе... и действие переназначить водителя, переназначить время
          depurture time
        </p>
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
};

export default WarningModal;
