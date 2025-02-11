import { useCallback } from 'react';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';
import { AdditionalService, Point } from '@prisma/client';

export interface FetchPointsResponse {
  data: {
    points: Point[];
    total: number;
    page: number;
    per_page: number;
  };
}

export const useApi = () => {
  //Мемоизируем функцию запроса точек
  const fetchPoints = useCallback(
    async (
      search: string = '',
      page: string = '1',
      per_page: string = '10',
      sort_by: 'address' | 'basePrice' | 'createdAt' | 'updatedAt' = 'createdAt',
      sort_order: 'asc' | 'desc' = 'asc',
    ): Promise<FetchPointsResponse> => {
      const params = new URLSearchParams({
        page,
        per_page,
        sort_by,
        sort_order,
        search,
      });

      const response = await fetch(`/api/points?${params.toString()}`);
      if (!response.ok) {
        const error = new Error('Не удалось получить список точек');
        console.error('Ошибка при получении списка точек:', error);
        throw error;
      }
      const data = await response.json();
      console.log('data', data);
      return data as FetchPointsResponse;
    },
    [],
  );

  //Мемоизируем функцию запроса тарифов
  const fetchTariffs = useCallback(async (): Promise<DetailTariffData[]> => {
    const response = await fetch('/api/tariffs');
    if (!response.ok) {
      throw new Error('Не удалось получить список тарифов');
    }
    const data = await response.json();
    if (data.data && data.data.tariffs) {
      return data.data.tariffs;
    } else {
      console.warn('Неожиданная структура данных для тарифов:', data);
      return [];
    }
  }, []);

  //Мемоизируем функцию запроса дополнительных услуг
  const fetchAdditionalServices = useCallback(async (): Promise<AdditionalService[]> => {
    const url = '/api/additional-services?page=1&per_page=100';
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Не удалось получить дополнительные услуги: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.data && data.data.additionalServices) {
        return data.data.additionalServices as AdditionalService[];
      } else {
        console.warn('Неожиданная структура данных для дополнительных услуг:', data);
        return [];
      }
    } catch (error) {
      console.error('Ошибка при получении дополнительных услуг:', error);
      return [];
    }
  }, []);

  return { fetchPoints, fetchTariffs, fetchAdditionalServices };
};
