import axios from 'axios';

export interface PointCoordinates {
  latitude: number;
  longitude: number;
}

export interface OSRMRouteResponse {
  routes: Array<{
    distance: number;
    duration: number;
  }>;
  code: string;
  waypoints: Array<any>;
}

export async function getDrivingDistance(
  from: PointCoordinates,
  to: PointCoordinates,
): Promise<number> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=false`;
    const response = await axios.get<OSRMRouteResponse>(url);

    //Проверяем, что массив routes существует и содержит хотя бы один элемент
    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const distanceInMeters = response.data.routes[0]?.distance;
      if (distanceInMeters === undefined) {
        throw new Error('Не удалось получить расстояние из данных маршрута.');
      }
      return distanceInMeters / 1000;
    } else {
      throw new Error('Не удалось получить данные о маршруте от OSRM.');
    }
  } catch (error) {
    console.error('Ошибка при запросе к OSRM API:', error);
    throw error;
  }
}
