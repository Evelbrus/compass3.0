'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUnit } from 'effector-react';
import { IButton } from '@shared/components/ui/buttons';
import { TextInput } from '@shared/components/ui/inputs';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { $pointUuid, setPointUuid, triggerUpdate } from '@shared/lib/effector/state/state';
import { showToast } from '@shared/components/toast/ToastManager';
import { YMaps, Map, Placemark, useYMaps } from '@pbe/react-yandex-maps';

interface CreatePointModalProps {
  onClose: () => void;
}

const DEFAULT_CENTER = [42.856219, 74.603967];
const DEFAULT_ZOOM = 10;

const MapComponent: React.FC<{
  coordinates: [number, number] | null;
  setCoordinates: (coords: [number, number]) => void;
  setAddress: (address: string) => void;
}> = ({ coordinates, setCoordinates, setAddress }) => {
  const mapRef = useRef<any>(null);
  const ymaps = useYMaps(['geocode']);

  const handleMapClick = (event: any) => {
    const coords = event.get('coords');

    if (coords && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      const lat = parseFloat(coords[0].toFixed(6));
      const lon = parseFloat(coords[1].toFixed(6));
      const validCoords: [number, number] = [lat, lon];
      setCoordinates(validCoords);

      if (ymaps) {
        ymaps
          .geocode(validCoords)
          .then((result) => {
            const firstGeoObject = result.geoObjects.get(0);
            if (firstGeoObject) {
              const location = String((firstGeoObject.properties.get as (key: string, defaultValue?: any) => any)('description') || '');
              const route = String((firstGeoObject.properties.get as (key: string, defaultValue?: any) => any)('name') || '');
              const fullAddress = `${location}${location && route ? ', ' : ''}${route}`.trim();
              console.log('Полученный адрес:', fullAddress);
              setAddress(fullAddress);
            } else {
              console.warn('Геокодирование не вернуло объектов');
              setAddress('Адрес не найден');
            }
          })
          .catch((err) => {
            console.error('Ошибка геокодирования:', err);
            setAddress('Ошибка получения адреса');
          });
      } else {
        console.warn('YMaps не загружен');
        setAddress('Ошибка: карта не инициализирована');
      }
    } else {
      console.warn('Некорректные координаты:', coords);
      showToast.error('Ошибка: некорректные координаты');
    }
  };

  const handleMapLoad = (ymapsInstance: any) => {
    if (mapRef.current) {
      mapRef.current.events.add('click', handleMapClick);
    }
  };

  return (
    <Map
      defaultState={{ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM }}
      width="100%"
      height="500px"
      onClick={handleMapClick}
      options={{
        suppressMapOpenBlock: true,
        suppressObsoleteBrowserNotifier: true,
        yandexMapDisablePoiInteractivity: true,
      }}
      style={{ width: '100%', height: '500px', minHeight: '500px', overflow: 'hidden' }}
      instanceRef={mapRef}
      onLoad={handleMapLoad}
    >
      {coordinates && <Placemark geometry={coordinates} />}
    </Map>
  );
};

const CreatePointModal: React.FC<CreatePointModalProps> = ({ onClose }) => {
  const uuid = useUnit($pointUuid);

  const [address, setAddress] = useState('');
  const [pricePerKm, setPricePerKm] = useState('');
  const [terrainDifficulty, setTerrainDifficulty] = useState('1.0');
  const [latitude, setLatitude] = useState<string>('42.856219');
  const [longitude, setLongitude] = useState<string>('74.603967');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uuid) {
      const fetchPoint = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/points/${uuid}`, { credentials: 'include' });
          if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
          const data = await response.json();
          const point = data.data?.point;
          if (!point) throw new Error('Данные точки отсутствуют');

          setAddress(point.address);
          setPricePerKm(point.pricePerKm.toString());
          setTerrainDifficulty(point.terrainDifficulty.toString());
          setLatitude(point.latitude.toString());
          setLongitude(point.longitude.toString());
        } catch (err) {
          console.error('Ошибка загрузки точки:', err);
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

    if (!address || !pricePerKm || !terrainDifficulty || !latitude || !longitude) {
      setError('Все поля обязательны');
      return;
    }

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
      setError('Некорректные числовые значения');
      return;
    }

    setLoading(true);

    try {
      const method = uuid ? 'PUT' : 'POST';
      const url = uuid ? `/api/points/${uuid}` : '/api/points';
      const body = JSON.stringify({
        address,
        pricePerKm: parsedPricePerKm,
        terrainDifficulty: parsedTerrainDifficulty,
        airport: false,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
      });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Ошибка ${uuid ? 'обновления' : 'создания'} точки`);
      }

      showToast.success(`Точка успешно ${uuid ? 'обновлена' : 'создана'}`);
      triggerUpdate();
      setPointUuid(null);
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
    setPointUuid(null);
    onClose();
  };

  const handleMapCoordinatesChange = (coords: [number, number]) => {
    setLatitude(coords[0].toString());
    setLongitude(coords[1].toString());
  };

  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

  // Логирование для отладки
  useEffect(() => {
    console.log('Yandex Maps API Key:', apiKey ? 'Ключ существует' : 'Ключ отсутствует');
    console.log('API Key первые 5 символов:', apiKey?.substring(0, 5));
  }, [apiKey]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent duration={500} className="w-[580px] max-h-[800px] flex justify-center">
        <div className="bg-white rounded-3xl p-8 relative w-full overflow-y-auto">
          <IButton
            variant="close"
            onClick={handleClose}
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
              disabled={loading}
            />

            <TextInput
              label="Цена за километр:"
              type="number"
              value={pricePerKm}
              onChange={(value) => setPricePerKm(value as string)}
              required
              step="0.01"
              disabled={loading}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Коэффициент сложности местности: {terrainDifficulty}</label>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.1"
                value={terrainDifficulty}
                onChange={(e) => setTerrainDifficulty(e.target.value)}
                disabled={loading}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Выберите точку на карте:</label>
              <YMaps
                query={{
                  apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY,
                  load: 'Map,Placemark,geocode',
                }}
              >
                <MapComponent
                  coordinates={latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : null}
                  setCoordinates={handleMapCoordinatesChange}
                  setAddress={setAddress}
                />
              </YMaps>
            </div>

            <TextInput
              label="Широта (Latitude):"
              type="number"
              value={latitude}
              onChange={(value) => setLatitude(value as string)}
              required
              step="0.000001"
              disabled={loading}
            />

            <TextInput
              label="Долгота (Longitude):"
              type="number"
              value={longitude}
              onChange={(value) => setLongitude(value as string)}
              required
              step="0.000001"
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

export default CreatePointModal;