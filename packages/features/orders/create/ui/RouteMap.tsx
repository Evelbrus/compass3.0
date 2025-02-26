import React, { useEffect, useState, useRef, useCallback } from 'react';
import { YMaps, Map, Placemark, withYMaps } from '@pbe/react-yandex-maps';
import { Point } from '@prisma/client';
import { PointWithoutTimestamps } from '@features/orders/create/hooks/points/useAllPoints';

interface RouteMapProps {
  allPoints: PointWithoutTimestamps[];
  selectedPoints: (PointWithoutTimestamps | null)[]; // Изменяем тип здесь
  onPointSelect: (point: PointWithoutTimestamps, isSelected: boolean) => void; // И здесь
  onDistanceUpdate?: (distance: number) => void;
  onDurationUpdate?: (duration: string | null) => void;
}

interface RouteMapInnerProps extends RouteMapProps {
  ymaps?: any;
}

const RouteMapInner: React.FC<RouteMapInnerProps> = ({
  ymaps,
  allPoints,
  selectedPoints,
  onPointSelect,
  onDistanceUpdate,
  onDurationUpdate,
}) => {
  const mapRef = useRef<any>(null);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);
  const initialBoundsRef = useRef<any>(null); // Сохраняем начальные границы в рефе

  // Устанавливаем начальные границы только один раз
  useEffect(() => {
    if (!ymaps || !allPoints.length || !mapRef.current || initialBoundsRef.current) return;

    const coordinates = allPoints.map((point) => [point.latitude, point.longitude]);
    const newBounds = ymaps.util.bounds.fromPoints(coordinates);
    initialBoundsRef.current = newBounds;
    mapRef.current.setBounds(newBounds); // Устанавливаем границы вручную
  }, [ymaps, allPoints]);

  // Обновление маршрута без изменения центра карты
  useEffect(() => {
    if (!ymaps || !mapRef.current) return;

    const geoObjects = mapRef.current.geoObjects;
    if (!geoObjects) return;

    geoObjects.each((obj: any) => {
      if (obj.properties.get('type') === 'route') {
        geoObjects.remove(obj);
      }
    });

    if (selectedPoints.length < 2) {
      setRouteDuration(null);
      onDistanceUpdate?.(0);
      onDurationUpdate?.(null);
      return;
    }

    const validPoints = selectedPoints
      .filter((point): point is Point => point !== null)
      .map((point) => [point.latitude, point.longitude]);

    if (validPoints.length < 2) return;

    let canceled = false;

    const multiRoute = new ymaps.multiRouter.MultiRoute(
      {
        referencePoints: validPoints,
        params: {
          routingMode: 'auto',
        },
      },
      {
        boundsAutoApply: false, // Отключаем авто-подстройку
      },
    );

    multiRoute.properties.set('type', 'route');
    geoObjects.add(multiRoute);

    multiRoute.model.events.add('update', () => {
      if (canceled || !mapRef.current) return;

      const activeRoute = multiRoute.getActiveRoute();
      if (activeRoute) {
        const humanTime = activeRoute.properties.get('duration').text;
        const distanceInMeters = activeRoute.properties.get('distance').value;
        const distanceInKm = distanceInMeters / 1000;
        setRouteDuration(humanTime || 'Время неизвестно');
        onDistanceUpdate?.(distanceInKm);
        onDurationUpdate?.(humanTime || 'Время неизвестно');
      } else {
        setRouteDuration('Маршрут не найден');
        onDistanceUpdate?.(0);
        onDurationUpdate?.('Маршрут не найден');
      }
    });

    multiRoute.events.add('error', (e: any) => {
      if (!canceled) {
        console.error('Ошибка построения маршрута:', e.get('error'));
        setRouteDuration('Ошибка расчета');
        onDistanceUpdate?.(0);
        onDurationUpdate?.('Ошибка расчета');
      }
    });

    return () => {
      canceled = true;
      if (mapRef.current) {
        geoObjects.remove(multiRoute);
      }
    };
  }, [ymaps, selectedPoints, onDistanceUpdate, onDurationUpdate]);

  const handlePointClick = useCallback(
    (point: PointWithoutTimestamps) => {
      const isAlreadySelected = selectedPoints.some((p) => p?.uuid === point.uuid);
      onPointSelect(point, isAlreadySelected);
    },
    [selectedPoints, onPointSelect],
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Map
        instanceRef={mapRef}
        defaultState={{
          center:
            allPoints.length && allPoints[0]
              ? [allPoints[0].latitude, allPoints[0].longitude]
              : [55.75, 37.57], // Центр по умолчанию (Москва)
          zoom: 7, // Начальный зум
        }}
        width="100%"
        height="650px"
      >
        {allPoints.map((point) => (
          <Placemark
            key={point.uuid}
            geometry={[point.latitude, point.longitude]}
            properties={{
              // Убираем hintContent и balloonContent, чтобы ничего не всплывало
              type: 'point',
            }}
            options={{
              preset: selectedPoints.some((p) => p?.uuid === point.uuid)
                ? 'islands#redDotIcon'
                : 'islands#blueDotIcon',
              cursor: 'pointer',
              // Отключаем открытие балуна и подсказки
              balloonCloseButton: false,
              hideIconOnBalloonOpen: false,
              openBalloonOnClick: false, // Отключаем всплывание балуна при клике
              openHintOnHover: false, // Отключаем подсказку при наведении
            }}
            onClick={() => handlePointClick(point)}
          />
        ))}
      </Map>
      {routeDuration && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            background: 'white',
            padding: '5px',
            borderRadius: '5px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          Время в пути: {routeDuration}
        </div>
      )}
    </div>
  );
};

const ConnectedRouteMap = withYMaps(RouteMapInner, true, ['multiRouter.MultiRoute', 'util.bounds']);

const RouteMap: React.FC<RouteMapProps> = ({
  allPoints,
  selectedPoints,
  onPointSelect,
  onDistanceUpdate,
  onDurationUpdate,
}) => {
  return (
    <YMaps
      query={{
        apikey: process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY,
        load: 'Map,Placemark,multiRouter.MultiRoute,util.bounds',
      }}
    >
      <ConnectedRouteMap
        allPoints={allPoints}
        selectedPoints={selectedPoints}
        onPointSelect={onPointSelect}
        onDistanceUpdate={onDistanceUpdate}
        onDurationUpdate={onDurationUpdate}
      />
    </YMaps>
  );
};

export default React.memo(RouteMap);
