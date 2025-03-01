import React, { useEffect, useState, useRef, useCallback } from 'react';
import { YMaps, Map, Placemark, withYMaps } from '@pbe/react-yandex-maps';
import { Point } from '@prisma/client';
import { PointWithoutTimestamps } from '@features/orders/create/types/types';

interface RouteMapProps {
  allPoints: PointWithoutTimestamps[];
  selectedPoints: (PointWithoutTimestamps | null)[];
  onPointSelect: (point: PointWithoutTimestamps, isSelected: boolean) => void;
  onDistanceUpdate?: (distance: number) => void;
  onDurationUpdate?: (duration: string | null) => void;
}

interface RouteMapInnerProps extends RouteMapProps {
  ymaps?: any;
}

// Define point icons for different roles
const POINT_ICONS = {
  departure: 'islands#blueStretchyIcon',
  arrival: 'islands#redStretchyIcon',
  additional: [
    'islands#greenStretchyIcon',
    'islands#violetStretchyIcon',
    'islands#orangeStretchyIcon',
    'islands#darkBlueStretchyIcon',
    'islands#pinkStretchyIcon',
  ],
  unselected: 'islands#lightBlueCircleIcon',
};

const RouteMapInner: React.FC<RouteMapInnerProps> = ({
  ymaps,
  allPoints,
  selectedPoints,
  onPointSelect,
  onDistanceUpdate,
  onDurationUpdate,
}) => {
  const mapRef = useRef<any>(null);
  const [_routeDuration, setRouteDuration] = useState<string | null>(null);
  const initialBoundsRef = useRef<any>(null);
  const [hoveredPoint, setHoveredPoint] = useState<PointWithoutTimestamps | null>(null);

  // Track point letters to maintain them when points are removed
  const [pointLetters, setPointLetters] = useState<{ [key: string]: string }>({});

  // Update point letters whenever selectedPoints changes
  useEffect(() => {
    const newPointLetters = { ...pointLetters };

    // First, assign letters to points that don't have them yet
    selectedPoints.forEach((point, index) => {
      if (!point) return;

      // If this point doesn't have a letter yet, assign one based on position
      if (!newPointLetters[point.uuid]) {
        if (index === 0) {
          newPointLetters[point.uuid] = 'A';
        } else if (index === selectedPoints.filter((p) => p !== null).length - 1) {
          newPointLetters[point.uuid] = 'B';
        } else {
          // Find the next available letter for intermediate points
          const letter = String.fromCharCode(67 + (index - 1)); // C, D, E, etc.
          newPointLetters[point.uuid] = letter;
        }
      }
    });

    // Remove letters for points that are no longer selected
    Object.keys(newPointLetters).forEach((uuid) => {
      const pointExists = selectedPoints.some((point) => point?.uuid === uuid);
      if (!pointExists) {
        delete newPointLetters[uuid];
      }
    });

    setPointLetters(newPointLetters);
  }, [selectedPoints]);

  // Set initial map bounds
  useEffect(() => {
    if (!ymaps || !allPoints.length || !mapRef.current || initialBoundsRef.current) return;

    const coordinates = allPoints.map((point) => [point.latitude, point.longitude]);
    const newBounds = ymaps.util.bounds.fromPoints(coordinates);
    initialBoundsRef.current = newBounds;
    mapRef.current.setBounds(newBounds);
  }, [ymaps, allPoints]);

  // Function to build the route
  const buildRoute = useCallback(() => {
    console.log('Attempting to build route...');
    if (!ymaps) {
      console.log('ymaps is not available yet.');
      return;
    }

    if (!mapRef.current) {
      console.log('mapRef.current is not available yet.');
      return;
    }

    const geoObjects = mapRef.current.geoObjects;
    if (!geoObjects) {
      console.log('geoObjects is not available yet.');
      return;
    }

    // Remove all existing multiRouter.MultiRoute instances
    geoObjects.each((geoObject: any) => {
      // Явно указываем тип параметра geoObject
      if (geoObject instanceof ymaps.multiRouter.MultiRoute) {
        geoObjects.remove(geoObject);
        console.log('Removed existing MultiRoute instance.');
      }
    });

    if (selectedPoints.length < 2) {
      setRouteDuration(null);
      onDistanceUpdate?.(0);
      onDurationUpdate?.(null);
      console.log('Less than 2 selected points, clearing route.');
      return;
    }

    const validPoints = selectedPoints
      .filter((point): point is Point => point !== null)
      .map((point) => [point.latitude, point.longitude]);

    if (validPoints.length < 2) {
      console.log('Less than 2 valid points, clearing route.');
      return;
    }

    console.log('Building route with points:', validPoints);

    try {
      const multiRoute = new ymaps.multiRouter.MultiRoute(
        {
          referencePoints: validPoints,
          params: {
            routingMode: 'auto',
          },
        },
        {
          boundsAutoApply: false,
          wayPointVisible: false,
          pinVisible: false,
        },
      );

      multiRoute.properties.set('type', 'route');
      geoObjects.add(multiRoute);

      multiRoute.model.events.add('update', () => {
        console.log('Route updated.');
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
        console.error('Error building route:', e.get('error'));
        setRouteDuration('Ошибка расчета');
        onDistanceUpdate?.(0);
        onDurationUpdate?.('Ошибка расчета');
      });
    } catch (error) {
      console.error('Error creating multiRoute:', error);
    }
  }, [ymaps, selectedPoints, onDistanceUpdate, onDurationUpdate]);

  // Update route when selected points change
  useEffect(() => {
    console.log('Selected points changed:', selectedPoints);

    if (ymaps) {
      console.log('ymaps is available, calling ymaps.ready.');
      ymaps.ready(() => {
        console.log('ymaps.ready callback triggered, building route.');
        buildRoute();
      });
    } else {
      console.log('ymaps is not yet available.');
    }
  }, [ymaps, selectedPoints, buildRoute]);

  const handlePointClick = useCallback(
    (point: PointWithoutTimestamps) => {
      const isAlreadySelected = selectedPoints.some((p) => p?.uuid === point.uuid);
      onPointSelect(point, isAlreadySelected);
    },
    [selectedPoints, onPointSelect],
  );

  // Handle mouse enter on placemark
  const handleMouseEnter = useCallback((point: PointWithoutTimestamps) => {
    setHoveredPoint(point);
  }, []);

  // Handle mouse leave on placemark
  const handleMouseLeave = useCallback(() => {
    setHoveredPoint(null);
  }, []);

  // Get icon and label for a point
  const getPointStyle = useCallback(
    (point: PointWithoutTimestamps) => {
      const pointIndex = selectedPoints.findIndex((p) => p?.uuid === point.uuid);

      if (pointIndex === -1) {
        return {
          preset: POINT_ICONS.unselected,
          iconContent: '',
          hintContent: point.address || 'Адрес неизвестен',
        };
      }

      const letter = pointLetters[point.uuid] || '';
      let preset: string;

      if (pointIndex === 0) {
        preset = POINT_ICONS.departure;
      } else if (pointIndex === selectedPoints.filter((p) => p !== null).length - 1) {
        preset = POINT_ICONS.arrival;
      } else {
        const additionalIndex = letter.charCodeAt(0) - 67;
        const colorIndex = Math.min(additionalIndex, POINT_ICONS.additional.length - 1);
        preset = POINT_ICONS.additional[Math.max(0, colorIndex)] ?? 'islands#lightBlueCircleIcon';
      }

      return {
        preset,
        iconContent: letter,
        hintContent: point.address || 'Адрес неизвестен',
      };
    },
    [selectedPoints, pointLetters],
  );

  // Get info about hovered point
  const getHoveredPointInfo = useCallback(() => {
    if (!hoveredPoint) return null;

    const pointIndex = selectedPoints.findIndex((p) => p?.uuid === hoveredPoint.uuid);
    let pointType = '';
    let letter = '';

    if (pointIndex === -1) {
      pointType = 'Доступная точка';
    } else {
      letter = pointLetters[hoveredPoint.uuid] || '';

      if (pointIndex === 0) {
        pointType = 'Точка отправления';
      } else if (pointIndex === selectedPoints.filter((p) => p !== null).length - 1) {
        pointType = 'Точка прибытия';
      } else {
        pointType = 'Промежуточная точка';
      }
    }

    return {
      letter,
      pointType,
      address: hoveredPoint.address,
      airport: hoveredPoint.airport,
    };
  }, [hoveredPoint, selectedPoints, pointLetters]);

  const hoveredPointInfo = getHoveredPointInfo();

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <Map
        instanceRef={mapRef}
        defaultState={{
          center:
            allPoints.length && allPoints[0]
              ? [allPoints[0].latitude, allPoints[0].longitude]
              : [55.75, 37.57],
          zoom: 7,
        }}
        options={{
          suppressMapOpenBlock: true,
        }}
        width="100%"
        height="100%"
        onLoad={() => {
          // Call buildRoute when the map is loaded
          console.log('Map loaded, calling buildRoute.');
          buildRoute();
        }}
      >
        {allPoints.map((point) => {
          const { preset, iconContent, hintContent } = getPointStyle(point);
          return (
            <Placemark
              key={point.uuid}
              geometry={[point.latitude, point.longitude]}
              properties={{
                iconContent,
                hintContent: '',
                type: 'point',
              }}
              options={{
                preset,
                cursor: 'pointer',
                openHintOnHover: false,
                iconOffset: [0, 0],
              }}
              onClick={() => handlePointClick(point)}
              onMouseEnter={() => handleMouseEnter(point)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </Map>

      {/* Tooltip in top-right corner that shows hovered point info */}
      {hoveredPointInfo && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10 min-w-[250px] max-w-[350px]">
          <div className="flex items-center mb-2">
            {hoveredPointInfo.letter && (
              <div
                className={`
                w-6 h-6 rounded-full flex items-center justify-center font-bold mr-2 text-white
                ${
                  hoveredPointInfo.letter === 'A'
                    ? 'bg-blue-500'
                    : hoveredPointInfo.letter === 'B'
                      ? 'bg-red-500'
                      : hoveredPointInfo.letter === 'C'
                        ? 'bg-green-500'
                        : hoveredPointInfo.letter === 'D'
                          ? 'bg-purple-500'
                          : hoveredPointInfo.letter === 'E'
                            ? 'bg-orange-500'
                            : hoveredPointInfo.letter === 'F'
                              ? 'bg-cyan-500'
                              : 'bg-pink-500'
                }
              `}
              >
                {hoveredPointInfo.letter}
              </div>
            )}
            <div className="font-semibold text-gray-800">{hoveredPointInfo.pointType}</div>
          </div>

          <div className="text-gray-500 text-sm mb-1">Адрес:</div>
          <div className="text-gray-900 mb-2">{hoveredPointInfo.address}</div>

          {hoveredPointInfo.airport && (
            <div className="flex items-center text-blue-600 text-sm">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Аэропорт
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ConnectedRouteMap = withYMaps(RouteMapInner, true, ['multiRouter.MultiRoute', 'util.bounds']);

export const RouteMap: React.FC<RouteMapProps> = ({
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
