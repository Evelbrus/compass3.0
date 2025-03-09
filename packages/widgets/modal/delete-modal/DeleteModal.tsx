import React from 'react';
import { useUnit } from 'effector-react';
import { $entityToDelete, closeModal, triggerUpdate } from '@shared/lib/effector';
import { showToast } from '@shared/components/toast/ToastManager';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

interface DeleteModalProps {
  onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ onClose }) => {
  const entityToDelete = useUnit($entityToDelete);

  const handleDelete = async () => {
    if (!entityToDelete) return;

    let apiPath = '';
    let successMessage = '';
    let errorMessage = '';

    switch (entityToDelete.entity) {
      case 'orders':
        apiPath = `/api/admin/orders/${entityToDelete.uuid}`;
        successMessage = 'Заказ успешно удалён!';
        errorMessage = 'Ошибка при удалении заказа.';
        break;
      case 'vehicles':
        apiPath = `/api/admin/vehicles/${entityToDelete.uuid}`;
        successMessage = 'Машина успешно удалена!';
        errorMessage = 'Ошибка при удалении машины.';
        break;
      case 'users':
        apiPath = `/api/admin/users/${entityToDelete.uuid}`;
        successMessage = 'Пользователь успешно удалён!';
        errorMessage = 'Ошибка при удалении пользователя.';
        break;
      case 'additional-services':
        apiPath = `/api/admin/additional-services/${entityToDelete.uuid}`;
        successMessage = 'услуга успешно удалёна!';
        errorMessage = 'Ошибка при удалении пользователя.';
        break;
      case 'points':
        apiPath = `/api/admin/points/${entityToDelete.uuid}`;
        successMessage = 'Адресс успешно удалён!';
        errorMessage = 'Ошибка при удалении пользователя.';
        break;
      default:
        console.error(`Неизвестный тип сущности: ${entityToDelete.entity}`);
        return;
    }

    try {
      const response = await fetch(apiPath, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid: entityToDelete.uuid }),
      });

      if (response.ok) {
        showToast.success(successMessage);
        triggerUpdate();
      } else {
        const errorData = await response.json();
        const errorMessageFromServer = errorData?.error || response.statusText;
        showToast.error(errorMessageFromServer || errorMessage);
        console.error(
          `Ошибка удаления ${entityToDelete.entity}:`,
          errorMessageFromServer || response.status,
        );
        return;
      }
    } catch (error) {
      console.error(`Ошибка удаления ${entityToDelete.entity}:`, error);
      showToast.error(errorMessage);
    } finally {
      closeModal();
    }
  };

  if (!entityToDelete) return null;

  const entityText = {
    orders: { name: 'заказ', text: 'заказа' },
    vehicles: { name: 'машина', text: 'машины' },
    users: { name: 'пользователя', text: 'пользователя' },
  };

  const currentEntityText = entityText[entityToDelete.entity as keyof typeof entityText] || {
    name: 'сущность',
    text: 'сущности',
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <AnimatedComponent duration={500}>
        <div className="relative flex flex-col justify-between bg-white rounded-3xl w-[500px] max-w-[500px] gap-2">
          <IButton
            variant="close"
            onClick={onClose}
            aria-label="Закрыть модальное окно"
            className="border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full"
          >
            <CloseIcon />
          </IButton>
          <h1 className="text-lg text-center font-semibold p-4 border-b border-gray-300">
            Подтверждение
          </h1>
          <div className="flex flex-col items-center p-4 gap-4">
            <h2 className="text-lg text-center font-semibold">
              Вы действительно хотите удалить {currentEntityText.name}?
            </h2>
            <p className="text-center justify-center max-w-[400px]">
              При удалении {currentEntityText.text} его невозможно будет вернуть, и данные будут
              полностью потеряны.
            </p>
          </div>
          <div className="flex mt-4 justify-center rounded-t rounded-3xl">
            <IButton
              onClick={onClose}
              className="px-8 py-4 bg-gray-500 border-x border-white text-white rounded-tl-2xl rounded-none hover:bg-gray-700"
            >
              Отмена
            </IButton>
            <IButton
              onClick={handleDelete}
              className="px-8 py-4 bg-red-500 border-x border-white text-white rounded-tr-2xl rounded-none hover:bg-red-700"
            >
              Удалить
            </IButton>
          </div>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default DeleteModal;
