'use client';

import React, { useState, useEffect } from 'react';
import { IButton } from '@shared/components/ui/buttons';
import { TextInput } from '@shared/components/ui/inputs';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { useUnit } from 'effector-react';
import { $pointUuid, setPointUuid } from '@shared/lib/effector/state/state';

interface CreatePointModalProps {
  onClose: () => void;
}

const CreatePointModal: React.FC<CreatePointModalProps> = ({ onClose }) => {
  const uuid = useUnit($pointUuid);

  const [address, setAddress] = useState('');
  const [pricePerKm, setPricePerKm] = useState<string | ''>('');
  const [terrainDifficulty, setTerrainDifficulty] = useState<string>('1.0');
  const [latitude, setLatitude] = useState<string | ''>('');
  const [longitude, setLongitude] = useState<string | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  //Если это редактирование, загружаем данные точки
  useEffect(() => {
    if (uuid) {
      const fetchPoint = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/points/${uuid}`);
          if (!response.ok) throw new Error(`Ошибка загрузки точки: ${response.status}`);

          const data = await response.json();
          console.log('Полученные данные точки:', data);

          if (!data.data || !data.data.point) throw new Error('Данные точки отсутствуют в ответе');

          const point = data.data.point;
          setAddress(point.address);
          setPricePerKm(point.pricePerKm.toString());
          setTerrainDifficulty(point.terrainDifficulty.toString());
          setLatitude(point.latitude.toString());
          setLongitude(point.longitude.toString());
        } catch (err) {
          console.error('Ошибка запроса:', err);
          setError('Ошибка загрузки данных');
        } finally {
          setLoading(false);
        }
      };

      fetchPoint();
    }
  }, [uuid]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!address || pricePerKm === '' || terrainDifficulty === '' || !latitude || !longitude) {
      setError('Все поля обязательны');
      return;
    }

    //Преобразуем строки в числа, проверяя на наличие десятичной точки
    const parsedPricePerKm = parseFloat(pricePerKm);
    const parsedTerrainDifficulty = parseFloat(terrainDifficulty);
    const parsedLatitude = parseFloat(latitude);
    const parsedLongitude = parseFloat(longitude);

    if (
      isNaN(parsedPricePerKm) ||
      isNaN(parsedTerrainDifficulty) ||
      isNaN(parsedLatitude) ||
      isNaN(parsedLongitude)
    ) {
      setError('Некоторые числовые поля содержат некорректные значения');
      return;
    }

    setLoading(true);

    try {
      const method = uuid ? 'PUT' : 'POST';
      const url = uuid ? `/api/points/${uuid}` : '/api/points';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address,
          pricePerKm: parsedPricePerKm,
          terrainDifficulty: parsedTerrainDifficulty,
          airport: false,
          latitude: parsedLatitude,
          longitude: parsedLongitude,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || `Ошибка ${uuid ? 'обновления' : 'создания'} точки`);
      } else {
        setSuccess(`Точка успешно ${uuid ? 'обновлена' : 'добавлена'}`);
        setTimeout(() => {
          setPointUuid(null);
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError('Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500} className="w-[580px] max-h[600px] flex justify-center">
        <div className="bg-white rounded-3xl p-8 relative w-full">
          {/*Кнопка закрытия */}
          <IButton
            variant="close"
            onClick={() => {
              setPointUuid(null);
              onClose();
            }}
            aria-label="Закрыть модальное окно"
            className="absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2"
          >
            <CloseIcon />
          </IButton>

          <h2 className="text-2xl font-semibold mb-4">
            {uuid ? 'Редактировать точку' : 'Добавить точку'}
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <TextInput
              label="Адрес:"
              value={address}
              onChange={(value) => setAddress(value as string)}
              required
            />

            <TextInput
              label="Цена за километр:"
              type="number"
              value={pricePerKm}
              onChange={(value) => setPricePerKm(value as string)}
              required
              step="0.01"
            />

            <TextInput
              label="Коэффициент сложности местности:"
              type="number"
              value={terrainDifficulty}
              onChange={(value) => setTerrainDifficulty(value as string)}
              required
              step="0.1"
            />

            <TextInput
              label="Широта (Latitude):"
              type="number"
              value={latitude}
              onChange={(value) => setLatitude(value as string)}
              required
              step="0.000001"
            />

            <TextInput
              label="Долгота (Longitude):"
              type="number"
              value={longitude}
              onChange={(value) => setLongitude(value as string)}
              required
              step="0.000001"
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
                {loading ? 'Сохранение...' : uuid ? 'Обновить' : 'Создать'}
              </IButton>
            </div>
          </form>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default CreatePointModal;
