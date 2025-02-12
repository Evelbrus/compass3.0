import { useState, useCallback } from 'react';
import { useUnit } from 'effector-react';
import { $updateFlag } from '@shared/lib/effector/state/state';
import { VehicleType } from '@prisma/client';
import { VehicleOverview } from '@shared/prisma/interface/vehicles/interface';
import { TableVehicleRow } from '@shared/components/ui/table';

export const useVehiclesData = () => {
  const updateFlag = useUnit($updateFlag);
  const [vehicles, setVehicles] = useState<VehicleOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<VehicleType | 'all'>('all');
  const [vehicleTypeCounts, setVehicleTypeCounts] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<keyof TableVehicleRow>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchVehicles = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setIsUpdating(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: perPage.toString(),
          vehicleType: vehicleTypeFilter === 'all' ? '' : vehicleTypeFilter,
          sortBy: sortBy.toString(),
          sortOrder,
        });

        const response = await fetch(`/api/vehicles?${params}`, {
          signal,
        });

        if (!response.ok) {
          setError(`Ошибка ${response.status}: ${response.statusText}`);
          return;
        }

        const { data } = await response.json();

        setVehicles(data.vehicles ?? []);
        setTotal(data.total);

        const vehicleTypeCountsData: Record<string, number> = {
          all: data.totalAllVehicles ?? data.total,
        };

        data.vehicleTypeCounts?.forEach((item: { type: VehicleType; count: number }) => {
          vehicleTypeCountsData[item.type] = item.count;
        });

        setVehicleTypeCounts(vehicleTypeCountsData);
        setError(null);
      } catch (error) {
        //Use instanceof to check if it's an Error object
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log('Запрос прерван');
            return;
          }
          console.error('Ошибка загрузки:', error);
          setError(error.message);
        } else {
          //Handle non-Error objects
          console.error('An unexpected error occurred:', error);
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
        setIsUpdating(false);
      }
    },
    [page, perPage, vehicleTypeFilter, sortBy, sortOrder, updateFlag],
  );

  return {
    vehicles,
    loading,
    error,
    page,
    perPage,
    total,
    vehicleTypeFilter,
    vehicleTypeCounts,
    sortBy,
    sortOrder,
    isUpdating,
    setPage,
    setVehicleTypeFilter,
    setSortBy,
    setSortOrder,
    fetchVehicles,
  };
};
