import React from 'react';
import { Notification } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { CloseIcon } from '@shared/components/ui/icon';
import { IButton } from '@shared/components/ui/buttons';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification;
}

const WarningAdminModal: React.FC<WarningModalProps> = ({ isOpen, onClose, notification }) => {
  const router = useRouter();

  //Функция для отправки PATCH-запроса
  const markNotificationAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/${notification.uuid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при обновлении уведомления');
      }
    } catch (error) {
      console.error('Не удалось отметить уведомление как прочитанное:', error);
    }
  };

  const handleRedirect = async () => {
    await markNotificationAsRead();
    router.push(`/order/edit/${notification.orderId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-[90%]">
        <IButton
          variant="close"
          onClick={onClose}
          aria-label="Закрыть модальное окно"
          className="absolute top-2 right-2 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full"
        >
          <CloseIcon />
        </IButton>
        <h2 className="text-xl font-semibold mb-4">Просроченный заказ</h2>
        <p className="mb-4 cursor-pointer hover:underline" onClick={handleRedirect}>
          Заказ #{notification.orderId} поступил с просрочкой. Перейти к заказу.
        </p>
      </div>
    </div>
  );
};

export default WarningAdminModal;
