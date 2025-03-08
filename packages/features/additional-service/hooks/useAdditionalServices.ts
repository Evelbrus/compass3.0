import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUnit } from 'effector-react';
import { TableAdditionalServicesRow } from '@shared/components/ui/table';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
import { AdditionalService } from '@prisma/client';
import { $updateFlag } from '@shared/lib/effector/state/state';

const useAdditionalServices = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const updateFlag = useUnit($updateFlag);

  // Инициализация состояния из URL параметров
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [optimisticPage, setOptimisticPage] = useState<number>(page);
  const [perPage] = useState<number>(Number(searchParams.get('per_page')) || 10);
  const [sortBy, setSortBy] = useState<keyof TableAdditionalServicesRow | null>(
    (searchParams.get('sort_by') as keyof TableAdditionalServicesRow) || null,
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(
    (searchParams.get('sort_order') as 'asc' | 'desc' | undefined) || 'desc',
  );

  // Данные из API
  const [additionalServices, setAdditionalServices] = useState<TableAdditionalServicesRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  // Функция получения данных с сервера
  const fetchAdditionalServices = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/additional-services', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', perPage.toString());
      if (sortBy !== null) {
        url.searchParams.append('sort_by', sortBy as string);
      }
      if (sortOrder) {
        url.searchParams.append('sort_order', sortOrder);
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Ошибка при загрузке данных');

      const { data } = await response.json();

      // Преобразуем данные в формат таблицы
      setAdditionalServices(
        data.additionalServices.map((service: AdditionalService, index: number) => ({
          number: (optimisticPage - 1) * perPage + index + 1,
          uuid: service.uuid,
          name: service.name,
          createdAt: new Date(service.createdAt),
          updatedAt: new Date(service.updatedAt),
          actions: renderActions({
            entity: 'additional-services',
            uuid: service.uuid,
            modalType: 'createAdditionalServiceModal',
            navigate: router.push,
          }),
        })),
      );

      setTotal(data.total);
      setError(null);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sortBy, sortOrder, optimisticPage]); // Добавили optimisticPage в зависимости

  // Эффект для загрузки данных при изменении параметров или флага обновления
  useEffect(() => {
    fetchAdditionalServices();
  }, [fetchAdditionalServices, updateFlag]); // Добавили updateFlag в зависимости

  // Функция смены страницы
  const handlePageChange = (newPage: number) => {
    setOptimisticPage(newPage);
    setPage(newPage);
  };

  const handleSort = (
    sortByKey: keyof TableAdditionalServicesRow | null,
    sortDirection: 'asc' | 'desc' | undefined,
  ) => {
    setSortBy(sortByKey);
    setSortOrder(sortDirection);
  };

  return {
    additionalServices,
    loading,
    error,
    total,
    optimisticPage,
    perPage,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSort,
  };
};

export default useAdditionalServices;