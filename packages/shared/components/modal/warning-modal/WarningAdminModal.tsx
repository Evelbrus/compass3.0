'use client';

import React, { useEffect, useState } from 'react';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';

interface WarningAdminModalProps {
  onClose: () => void;
}

const WarningAdminModal: React.FC<WarningAdminModalProps> = ({ onClose }) => {
  const [warningData, setWarningData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  //Функция загрузки данных предупреждения для администраторов/операторов
  //Здесь предполагается, что API возвращает нужную информацию по предупреждению.
  //Если данные берутся по какому-то конкретному идентификатору, можно передавать его через effector или через props.
  const fetchWarningData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/warnings`);
      if (!response.ok) {
        throw new Error(`Ошибка получения данных предупреждения: ${response.statusText}`);
      }
      const data = await response.json();
      setWarningData(data);
    } catch (err) {
      console.error('Ошибка при загрузке данных предупреждения:', err);
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных предупреждения');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarningData();
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500} className="bg-white rounded-3xl p-8 w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4">Предупреждение</h2>
        {loading ? (
          <p>Загрузка данных предупреждения...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : warningData ? (
          <div>
            <p>
              <strong>ID заказа:</strong> {warningData.orderId}
            </p>
            <p>
              <strong>Сообщение:</strong> {warningData.message || 'Нет подробностей'}
            </p>
            <p>
              <strong>Дата:</strong> {new Date(warningData.createdAt).toLocaleString()}
            </p>
            {/*Здесь можно добавить дополнительные данные или действия для оператора/администратора */}
          </div>
        ) : (
          <p>Данных предупреждения не найдено.</p>
        )}
        <IButton onClick={onClose} className="mt-4">
          Закрыть
        </IButton>
      </AnimatedComponent>
    </div>
  );
};

export default WarningAdminModal;
