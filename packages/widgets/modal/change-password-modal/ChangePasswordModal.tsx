import React, { useState } from 'react';
import { useUnit } from 'effector-react';
import { TextInput } from '@shared/components/ui/inputs';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { $userUuid, $userFullName } from '@shared/lib/effector';
import { IButton } from '@shared/components/ui/buttons';

interface ChangePasswordModalProps {
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  //Получаем uuid и fullName пользователя из Effector‑хранилища
  const userUuid = useUnit($userUuid);
  const userFullName = useUnit($userFullName);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Новый пароль и подтверждение не совпадают');
      return;
    }

    if (!userUuid) {
      setError('Идентификатор пользователя не найден');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/shared/patch-user-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uuid: userUuid,
          fullName: userFullName,
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка обновления пароля');
      } else {
        setSuccess('Пароль успешно обновлён');
        //Если нужно, можно закрыть модалку через некоторое время:
        //setTimeout(onClose, 1500);
      }
    } catch (err) {
      setError('Ошибка сервера');
      console.error('Error updating password:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500} className="w-[580px] max-h-[600px] flex justify-center">
        <div className="bg-white rounded-3xl p-8 relative w-full">
          {/*Кнопка закрытия */}
          <IButton
            variant="close"
            onClick={onClose}
            aria-label="Закрыть модальное окно"
            className="absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2"
          >
            <CloseIcon />
          </IButton>

          <h2 className="text-2xl font-semibold mb-4">
            Изменение пароля для <br /> {userFullName}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextInput
              label="Старый пароль:"
              type="password"
              value={oldPassword}
              onChange={(value) => setOldPassword(value as string)}
              required
            />

            <TextInput
              label="Новый пароль:"
              type="password"
              value={newPassword}
              onChange={(value) => setNewPassword(value as string)}
              required
            />

            <TextInput
              label="Подтверждение пароля:"
              type="password"
              value={confirmPassword}
              onChange={(value) => setConfirmPassword(value as string)}
              required
            />

            {error && <p className="text-red-600">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}

            <div className={'w-full flex flex-row justify-end'}>
              <IButton
                type="submit"
                disabled={loading}
                className="w-[205px] p-4 bg-[color:var(--button-secondary)]
                text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)]
                transition"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </IButton>
            </div>
          </form>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default ChangePasswordModal;
