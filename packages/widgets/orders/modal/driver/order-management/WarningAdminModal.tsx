'use client';

import React, { useState } from 'react';
import { Notification } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { markNotificationAsRead } from '@features/notifications/api/apiNotifications';

interface WarningAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification;
}

const WarningAdminModal: React.FC<WarningAdminModalProps> = ({ isOpen, onClose, notification }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const socket = useSocket('notification');

  const handleUpdateOrder = () => {
    setIsLoading(true);
    router.push(`/order/edit/${notification.orderId}`);
    onClose();
  };

  const handleClose = async () => {
    try {
      //Помечаем уведомление как прочитанное через API
      await markNotificationAsRead(notification.uuid);

      //Отправляем WebSocket-уведомление
      if (socket) {
        const updatedNotification = {
          uuid: notification.uuid,
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          orderId: notification.orderId,
          action: notification.action,
          read: true,
        };
        console.log('Отправляем WebSocket-уведомление (закрытие):', updatedNotification);
        socket.emit('notification', {
          userId: notification.userId,
          notification: updatedNotification,
        });
      }
    } catch (err) {
      console.error('Ошибка при пометке уведомления как прочитанного:', err);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-[90%]">
        <h2 className="text-xl font-semibold mb-4">Водитель не принял заказ</h2>
        <p className="mb-4">
          Заказ #{notification.orderId} не был принят водителем вовремя. Обновите заказ или закройте
          уведомление.
        </p>
        <div className="flex justify-end gap-2">
          <button
            className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleUpdateOrder}
            disabled={isLoading}
          >
            {isLoading ? 'Перенаправление...' : 'Обновить заказ'}
          </button>
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            onClick={handleClose}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarningAdminModal;
