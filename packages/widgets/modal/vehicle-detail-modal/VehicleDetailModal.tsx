'use client';

import React, { useEffect, useState } from 'react';
import { useUnit } from 'effector-react';
import { $vehicleUuid, closeModal } from '@shared/lib/effector';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { TextInput } from '@shared/components/ui/inputs';

const VehicleDetailModal = () => {
  const vehicleUuid = useUnit($vehicleUuid);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (vehicleUuid) {
        setLoading(true);
        try {
          const response = await fetch(`/api/admin/vehicles/${vehicleUuid}`);
          if (!response.ok) {
            throw new Error(`Не удалось загрузить данные автомобиля: ${response.status}`);
          }
          const data = await response.json();
          setVehicleData(data.data); // Извлекаем вложенный объект data
          setError(null);
        } catch (error) {
          console.error('Ошибка при загрузке данных автомобиля:', error);
          setError(error instanceof Error ? error.message : 'Не удалось загрузить данные');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchVehicleData();
  }, [vehicleUuid]);

  const closeModalHandler = () => {
    closeModal();
  };

  const handleDateChange = (field: string) => (value: string | number | null) => {
    if (typeof value === 'string') {
      setVehicleData((prev: any) => ({
        ...prev,
        [field]: value ? new Date(value).toISOString() : null,
      }));
    }
  };

  if (!vehicleUuid) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <AnimatedComponent duration={500} className="w-[580px] h-full max-h-[800px] flex justify-center">
          <div className="bg-white rounded-3xl p-8">
            <p>Автомобиль не выбран.</p>
            <IButton onClick={closeModalHandler}>Закрыть</IButton>
          </div>
        </AnimatedComponent>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <AnimatedComponent duration={500} className="w-[580px] h-full max-h-[800px] flex justify-center">
          <div className="bg-white rounded-3xl p-8 w-full max-w-3xl">
            <p>Загрузка...</p>
          </div>
        </AnimatedComponent>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <AnimatedComponent duration={500} className="w-[580px] h-full max-h-[800px] flex justify-center">
          <div className="bg-white rounded-3xl p-8 w-full max-w-3xl h-[600px]">
            <p>Ошибка: {error}</p>
            <IButton onClick={closeModalHandler}>Закрыть</IButton>
          </div>
        </AnimatedComponent>
      </div>
    );
  }

  const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="bg-white rounded-md w-full flex flex-col">
      <span className="block text-gray-500 font-extrabold mr-2 mb-2">{label}:</span>
      <span className="px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full">
        {value}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500} className="w-[580px] h-full max-h-[800px] flex justify-center">
        <div className="bg-white rounded-3xl p-8 relative w-full max-w-3xl overflow-auto">
          <IButton
            variant="close"
            onClick={closeModalHandler}
            aria-label="Закрыть модальное окно"
            className="absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2"
          >
            <CloseIcon />
          </IButton>
          <h2 className="text-2xl font-semibold mb-4">Детали автомобиля</h2>
          <div className="w-full flex flex-col mb-4 gap-4">
            <DetailItem label="Марка" value={vehicleData.brand || 'Не указано'} />
            <DetailItem label="Модель" value={vehicleData.model || 'Не указано'} />
            <div className="bg-white rounded-md w-full flex flex-col">
              <span className="block text-gray-500 font-extrabold mr-2 mb-2">Год выпуска:</span>
              <TextInput
                type="date"
                value={vehicleData.year || ''}
                onChange={handleDateChange('year')}
                placeholder="Выберите дату"
              />
            </div>
            <DetailItem label="Цвет" value={vehicleData.color || 'Не указано'} />
            <DetailItem label="Номерной знак" value={vehicleData.plateNumber || 'Не указано'} />
            <DetailItem label="Доступность" value={vehicleData.isAvailable ? 'Да' : 'Нет'} />
            <DetailItem label="Тип транспортного средства" value={vehicleData.vehicleType || 'Не указано'} />
            <DetailItem label="Уровень сервиса" value={vehicleData.serviceLevels || 'Не указано'} />
            {vehicleData.vehicleDrivers?.[0]?.driver && (
              <DetailItem
                label="Водитель"
                value={`${vehicleData.vehicleDrivers[0].driver.fullName} (${vehicleData.vehicleDrivers[0].driver.phone})`}
              />
            )}
            <div className="bg-white rounded-md w-full flex flex-col">
              <span className="block text-gray-500 font-extrabold mr-2 mb-2">Дата создания:</span>
              <TextInput
                type="date"
                value={vehicleData.createdAt || ''}
                onChange={handleDateChange('createdAt')}
                placeholder="Выберите дату и время"
              />
            </div>
            <div className="bg-white rounded-md w-full flex flex-col">
              <span className="block text-gray-500 font-extrabold mr-2 mb-2">Дата обновления:</span>
              <TextInput
                type="date"
                value={vehicleData.updatedAt || ''}
                onChange={handleDateChange('updatedAt')}
                placeholder="Выберите дату и время"
              />
            </div>
          </div>
          <div className="w-full flex justify-end">
            <IButton onClick={closeModalHandler}>Закрыть</IButton>
          </div>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default VehicleDetailModal;