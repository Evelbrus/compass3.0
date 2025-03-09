import React, { useState, useEffect } from 'react';
import { useUnit } from 'effector-react';
import { IButton } from '@shared/components/ui/buttons';
import { TextInput } from '@shared/components/ui/inputs';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { $additionalServiceUuid, setAdditionalServiceUuid, triggerUpdate } from '@shared/lib/effector/state/state';
import { showToast } from '@shared/components/toast/ToastManager';

interface CreateAdditionalServiceModalProps {
  onClose: () => void;
}

const CreateAdditionalServiceModal: React.FC<CreateAdditionalServiceModalProps> = ({ onClose }) => {
  const uuid = useUnit($additionalServiceUuid);

  const [serviceName, setServiceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных услуги при редактировании
  useEffect(() => {
    if (uuid) {
      const fetchService = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/shared/additional-services/${uuid}`, {
            credentials: 'include',
          });
          if (!response.ok) throw new Error('Ошибка загрузки услуги');
          const data = await response.json();
          setServiceName(data.name || '');
        } catch (err) {
          console.error('Ошибка загрузки услуги:', err);
          setError('Ошибка загрузки данных');
        } finally {
          setLoading(false);
        }
      };

      fetchService();
    }
  }, [uuid]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!serviceName) {
      setError('Название услуги обязательно');
      return;
    }

    setLoading(true);

    try {
      const method = uuid ? 'PUT' : 'POST';
      const url = uuid ? `/api/admin/additional-services/${uuid}` : '/api/admin/additional-services';
      const body = JSON.stringify({ name: serviceName });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Ошибка ${uuid ? 'обновления' : 'создания'} услуги`);
      }

      showToast.success(`Услуга успешно ${uuid ? 'обновлена' : 'создана'}`);
      triggerUpdate(); // Добавляем триггер обновления
      setAdditionalServiceUuid(null);
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error('Ошибка операции:', err);
      showToast.error(err instanceof Error ? err.message : 'Ошибка сервера');
      setError(err instanceof Error ? err.message : 'Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAdditionalServiceUuid(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500} className="w-[580px] max-h-[600px] flex justify-center">
        <div className="bg-white rounded-3xl p-8 relative w-full">
          <IButton
            variant="close"
            onClick={handleClose}
            aria-label="Закрыть модальное окно"
            className="absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2"
          >
            <CloseIcon />
          </IButton>

          <h2 className="text-2xl font-semibold mb-4">
            {uuid ? 'Редактировать услугу' : 'Добавить услугу'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextInput
              label="Название услуги:"
              value={serviceName}
              onChange={(value) => setServiceName(value as string)}
              required
              disabled={loading}
            />

            {error && <p className="text-red-600">{error}</p>}

            <div className="w-full flex flex-row justify-end">
              <IButton
                type="submit"
                disabled={loading}
                className="w-[205px] p-4 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              >
                {loading ? 'Сохранение...' : uuid ? 'Обновить' : 'Создать'}
              </IButton>
            </div>
          </form>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default CreateAdditionalServiceModal;