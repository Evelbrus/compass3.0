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

const DEFAULT_CENTER = [42.856219, 74.603967]; // Центр Кыргызстана (Бишкек)
const DEFAULT_ZOOM = 10;
const KYRGYZSTAN_BOUNDS = [
  [39.0, 69.0],
  [43.5, 81.0],
]; // Примерные границы Кыргызстана

// Функция для проверки, находится ли адрес в Кыргызстане
const isAddressInKyrgyzstan = (address: string): boolean => {
  if (!address) return false;

  // Проверяем наличие ключевых слов, указывающих на Кыргызстан
  const kyrgyzstanKeywords = [
    'Кыргызстан',
    'Киргизия',
    'Киргизская Республика',
    'Бишкек',
    'Ош',
    'Джалал-Абад',
    'Каракол',
    'Талас',
    'Нарын',
    'Баткен',
    'Чуйская область',
    'Иссык-Кульская область',
    'Нарынская область',
    'Таласская область',
    'Ошская область',
    'Баткенская область',
    'Джалал-Абадская область',
  ];

  const addressLower = address.toLowerCase();
  return kyrgyzstanKeywords.some((keyword) => addressLower.includes(keyword.toLowerCase()));
};

// Функция для прямого HTTP-запроса геокодирования через Яндекс API
const getAddressByCoordinates = async (
  lat: number,
  lon: number,
  apiKey: string,
): Promise<string> => {
  try {
    // Используем lon,lat (а не lat,lon) для Яндекс HTTP API геокодера
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${lon},${lat}&lang=ru_RU`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Ошибка HTTP при геокодировании: ${response.status}`);
      return 'Ошибка получения адреса';
    }

    const data = await response.json();

    // Извлечение адреса из ответа
    const geoObject = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
    if (geoObject) {
      return geoObject.metaDataProperty?.GeocoderMetaData?.text || 'Адрес не найден';
    } else {
      return 'Адрес не найден';
    }
  } catch (error) {
    console.error('Ошибка при запросе к geocode-maps API:', error);
    return 'Ошибка получения адреса';
  }
};

// Компонент всплывающего окна с информацией о точке
const PointInfoTooltip: React.FC<{
  address: string;
  pricePerKm: string;
  terrainDifficulty: string;
}> = ({ address, pricePerKm, terrainDifficulty }) => {
  return (
    <div className="p-3 bg-white rounded-lg shadow-md max-w-xs">
      <h3 className="font-medium text-sm mb-1 text-gray-800">Информация о точке</h3>
      <p className="text-xs mb-1 truncate">
        <span className="font-medium">Адрес:</span> {address}
      </p>
      <p className="text-xs mb-1">
        <span className="font-medium">Цена за км:</span> {pricePerKm} сом
      </p>
      <p className="text-xs">
        <span className="font-medium">Сложность:</span> {terrainDifficulty}
      </p>
    </div>
  );
};

const MapComponent: React.FC<{
  coordinates: [number, number] | null;
  setCoordinates: (coords: [number, number]) => void;
  setAddress: (address: string) => void;
  address: string;
  pricePerKm: string;
  terrainDifficulty: string;
}> = ({ coordinates, setCoordinates, setAddress, address, pricePerKm, terrainDifficulty }) => {
  const mapRef = useRef<any>(null);
  const ymaps = useYMaps(['geocode', 'Map']);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || '';

  useEffect(() => {
    if (ymaps) {
      setIsMapLoaded(true);
    }
  }, [ymaps]);

  const handleMapClick = async (event: any) => {
    const coords = event.get('coords');

    if (coords && coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      const lat = parseFloat(coords[0].toFixed(6));
      const lon = parseFloat(coords[1].toFixed(6));
      const validCoords: [number, number] = [lat, lon];

      try {
        // Получаем адрес по координатам
        const address = await getAddressByCoordinates(lat, lon, apiKey);

        // Проверяем, находится ли адрес в Кыргызстане
        if (!isAddressInKyrgyzstan(address)) {
          showToast.error('Выбранное место находится за пределами Кыргызстана');
          return;
        }

        // Устанавливаем координаты и адрес
        setCoordinates(validCoords);
        setAddress(address);
      } catch (error) {
        console.error('Ошибка получения адреса:', error);
        setAddress('Ошибка получения адреса');
      }
    } else {
      console.warn('Некорректные координаты:', coords);
      showToast.error('Ошибка: некорректные координаты');
    }
  };

  const handleMapLoad = (ymapsInstance: any) => {
    if (mapRef.current && ymaps) {
      // Добавляем обработчик клика
      mapRef.current.events.add('click', handleMapClick);

      // Центрируем карту на Кыргызстане
      try {
        mapRef.current.setCenter(DEFAULT_CENTER, DEFAULT_ZOOM);

        // Устанавливаем опцию для ограничения области просмотра
        mapRef.current.options.set('restrictMapArea', KYRGYZSTAN_BOUNDS);

        // Настраиваем поисковые контролы если они доступны
        if (mapRef.current.controls) {
          const searchControl = mapRef.current.controls.get('searchControl');
          if (searchControl) {
            searchControl.options.set({
              provider: 'yandex#search',
              // Устанавливаем предпочтительную область поиска
              boundedBy: KYRGYZSTAN_BOUNDS,
              strictBounds: true,
            });
          }
        }
      } catch (error) {
        console.error('Ошибка при настройке карты:', error);
      }
    }
  };

  return (
    <div className="relative rounded-lg overflow-hidden">
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
            <p>Загрузка карты...</p>
          </div>
        </div>
      )}

      <Map
        defaultState={{
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          controls: ['zoomControl', 'searchControl', 'fullscreenControl'],
        }}
        width="100%"
        height="500px"
        onClick={handleMapClick}
        options={{
          suppressMapOpenBlock: true,
          suppressObsoleteBrowserNotifier: true,
          yandexMapDisablePoiInteractivity: true,
          restrictMapArea: KYRGYZSTAN_BOUNDS,
        }}
        modules={[
          'Map',
          'Placemark',
          'control.ZoomControl',
          'control.SearchControl',
          'control.FullscreenControl',
        ]}
        style={{
          width: '100%',
          height: '500px',
          minHeight: '500px',
          overflow: 'hidden',
          backgroundColor: '#f5f9fe',
        }}
        instanceRef={mapRef}
        onLoad={handleMapLoad}
      >
        {coordinates && (
          <Placemark
            geometry={coordinates}
            options={{
              preset: 'islands#blueIcon',
              hideIconOnBalloonOpen: false,
              balloonOffset: [0, -35],
            }}
            properties={{
              balloonContentBody: `
                  <div style="padding: 10px; max-width: 250px;">
                    <h3 style="font-weight: 500; margin-bottom: 8px; font-size: 14px;">Информация о точке</h3>
                    <p style="font-size: 12px; margin-bottom: 4px;"><b>Адрес:</b> ${address}</p>
                    <p style="font-size: 12px; margin-bottom: 4px;"><b>Цена за км:</b> ${pricePerKm} сом</p>
                    <p style="font-size: 12px;"><b>Сложность местности:</b> ${terrainDifficulty}</p>
                  </div>
                `,
              balloonAutoPan: true,
            }}
          />
        )}
      </Map>

      {coordinates && (
        <div className="absolute bottom-4 right-4 z-10">
          <PointInfoTooltip
            address={address}
            pricePerKm={pricePerKm}
            terrainDifficulty={terrainDifficulty}
          />
        </div>
      )}
    </div>
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
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  // Проверяем доступность API Яндекс Карт
  useEffect(() => {
    const checkYandexMapsApi = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

        setIsApiLoaded(true);
      } catch (error) {
        console.error('Проверка API Яндекс Карт не удалась:', error);
        setError('Ошибка загрузки карты. Пожалуйста, попробуйте обновить страницу.');
        setIsApiLoaded(false);
      }
    };

    checkYandexMapsApi();
  }, []);

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
              <label className="text-sm font-medium">
                Коэффициент сложности местности: {terrainDifficulty}
              </label>
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
              {isApiLoaded ? (
                <YMaps
                  query={{
                    apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY,
                    load: 'package.full',
                    lang: 'ru_RU',
                    mode: 'release',
                  }}
                >
                  <MapComponent
                    coordinates={
                      latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : null
                    }
                    setCoordinates={handleMapCoordinatesChange}
                    setAddress={setAddress}
                    address={address}
                    pricePerKm={pricePerKm}
                    terrainDifficulty={terrainDifficulty}
                  />
                </YMaps>
              ) : (
                <div className="bg-gray-100 rounded-lg p-6 text-center h-[300px] flex items-center justify-center">
                  <div className="text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-3"></div>
                    <p>Загрузка карты...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Скрытые поля для широты и долготы, которые не видны пользователю, но отправляются в форме */}
            <input type="hidden" name="latitude" value={latitude} />
            <input type="hidden" name="longitude" value={longitude} />

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
