import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUnit } from 'effector-react';
import { TablePointsRow } from '@shared/components/ui/table';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
import { Point } from '@prisma/client';
import { $updateFlag } from '@shared/lib/effector/state/state';
import { checkAndHandleRedirect } from '@shared/api'; // Добавляем импорт

const usePoints = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const updateFlag = useUnit($updateFlag);

  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [optimisticPage, setOptimisticPage] = useState<number>(page);
  const [perPage] = useState<number>(Number(searchParams.get('per_page')) || 10);
  const [sortBy, setSortBy] = useState<keyof TablePointsRow | null>(
    (searchParams.get('sort_by') as keyof TablePointsRow) || null,
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | undefined>(
    (searchParams.get('sort_order') as 'asc' | 'desc' | undefined) || 'desc',
  );

  const [points, setPoints] = useState<TablePointsRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);

  const fetchPoints = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/shared/points', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', perPage.toString());
      if (sortBy !== null) {
        url.searchParams.append('sort_by', sortBy as string);
      }
      if (sortOrder) {
        url.searchParams.append('sort_order', sortOrder);
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        const data = await response.json();
        if (checkAndHandleRedirect(data)) {
          setPoints([]); // Очищаем точки при редиректе
          setTotal(0);
          return; // Прерываем выполнение после редиректа
        }
        throw new Error('Ошибка при загрузке данных');
      }

      const { data } = await response.json();

      setPoints(
        data.points.map((point: Point, index: number) => ({
          number: (optimisticPage - 1) * perPage + index + 1,
          uuid: point.uuid,
          address: point.address,
          pricePerKm: Number(point.pricePerKm) + '\u00A0сом',
          terrainDifficulty: Number(point.terrainDifficulty),
          latitude: Number(point.latitude),
          longitude: Number(point.longitude),
          airport: point.airport,
          createdAt: new Date(point.createdAt),
          updatedAt: new Date(point.updatedAt),
          actions: renderActions({
            entity: 'points',
            uuid: point.uuid,
            modalType: 'createPointModal',
            navigate: router.push,
          }),
        })),
      );
      setTotal(data.total);
      setError(null);
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, sortBy, sortOrder, router, optimisticPage]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints, updateFlag]);

  const handlePageChange = (newPage: number) => {
    setOptimisticPage(newPage);
    setPage(newPage);
  };

  const handleSort = (
    sortByKey: keyof TablePointsRow | null,
    sortDirection: 'asc' | 'desc' | undefined,
  ) => {
    setSortBy(sortByKey);
    setSortOrder(sortDirection);
  };

  return {
    points,
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

export default usePoints;
