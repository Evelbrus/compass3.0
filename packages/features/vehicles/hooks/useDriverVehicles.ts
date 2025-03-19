// @features/vehicles/hooks/useDriverVehicles.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { VehicleType, Vehicle } from '@prisma/client';
import { TableVehicleRow } from '@shared/components/ui/table';
import { renderActions } from '@shared/components/ui/table/ui/TableRenders';
import {
  formatDate,
  formatDateCreateAuto,
} from '@shared/components/ui/inputs/date/functions/formatDate';
import { checkAndHandleRedirect } from '@shared/api'; // Добавляем импорт

type VehicleWithDrivers = Vehicle & {
  vehicleDrivers: { driver: { uuid: string; fullName: string; phone: string } }[];
  drivers: { userUuid: string; fullName: string; phone: string }[];
};

const useDriverVehicles = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<VehicleType | 'all'>(
    (searchParams.get('vehicleType') as VehicleType) || 'all',
  );
  const [sortBy, setSortBy] = useState<keyof TableVehicleRow | null>(
    (searchParams.get('sort_by') as keyof TableVehicleRow) || 'createdAt',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc',
  );
  const [optimisticPage, setOptimisticPage] = useState(page);
  const [perPage] = useState<number>(Number(searchParams.get('per_page')) || 10);

  const [vehicles, setVehicles] = useState<VehicleWithDrivers[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [totalAllVehicles, setTotalAllVehicles] = useState<number>(0);
  const [vehicleTypeCounts, setVehicleTypeCounts] = useState<Record<string, number>>({});

  const fetchDriverVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/vehicles', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', perPage.toString());
      if (vehicleTypeFilter !== 'all') {
        url.searchParams.append('vehicleType', vehicleTypeFilter);
      }
      if (sortBy) {
        url.searchParams.append('sort_by', sortBy as string);
      }
      if (sortOrder) {
        url.searchParams.append('sort_order', sortOrder);
      }

      const response = await fetch(url.toString(), {
        credentials: 'include', // Для отправки cookies с токеном
      });
      if (!response.ok) throw new Error('Сетевой ответ был неудачным');

      const data = await response.json();

      // Проверка на редирект
      if (checkAndHandleRedirect(data)) {
        return; // Прерываем выполнение если произошел редирект
      }

      const { status, message, data: responseData } = data;
      if (status !== 'success') throw new Error(message);

      setVehicles(responseData.vehicles || []);
      setTotal(responseData.total);
      setTotalAllVehicles(responseData.totalAllVehicles);
      const vehicleTypeCountsData: Record<string, number> = { all: responseData.totalAllVehicles };
      responseData.vehicleTypeCounts?.forEach((item: { type: VehicleType; count: number }) => {
        vehicleTypeCountsData[item.type] = item.count;
      });
      setVehicleTypeCounts(vehicleTypeCountsData);
      setError(null);
    } catch (error) {
      console.error('Ошибка при получении транспортных средств водителя:', error);
      setError('Ошибка при получении транспортных средств');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, vehicleTypeFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchDriverVehicles();
  }, [fetchDriverVehicles]);

  const handlePageChange = (newPage: number) => {
    setOptimisticPage(newPage);
    setPage(newPage);
  };

  const handleSort = (
    sortByKey: keyof TableVehicleRow | null,
    sortDirection: 'asc' | 'desc' | undefined,
  ) => {
    setSortBy(sortByKey);
    setSortOrder(sortDirection ?? 'desc');
  };

  const handleVehicleTypeFilterChange = (newType: VehicleType | 'all') => {
    setVehicleTypeFilter(newType);
    setPage(1);
    setOptimisticPage(1);
  };

  const tableData: TableVehicleRow[] = vehicles.map((vehicle, index) => ({
    number: (optimisticPage - 1) * perPage + index + 1,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year ? formatDateCreateAuto(vehicle.year) : 'N/A',
    color: vehicle.color,
    plateNumber: vehicle.plateNumber,
    isAvailable: vehicle.isAvailable ? 'Yes' : 'No',
    vehicleInfo: {
      vehicleType: vehicle.vehicleType,
      serviceLevels: vehicle.serviceLevels || 'N/A',
    },
    driverInfo: vehicle.drivers?.[0]
      ? {
          phone: vehicle.drivers[0].phone || 'Не указано',
          fullName: vehicle.drivers[0].fullName || 'Не указано',
        }
      : null,
    createdAt: formatDate(vehicle.createdAt),
    updatedAt: formatDate(vehicle.updatedAt),
    actions: renderActions({
      entity: 'vehicles',
      uuid: vehicle.uuid,
      navigate: router.push,
    }),
  }));

  return {
    vehicles: tableData,
    loading,
    error,
    total,
    totalAllVehicles,
    vehicleTypeCounts,
    optimisticPage,
    perPage,
    vehicleTypeFilter,
    sortBy,
    sortOrder,
    handlePageChange,
    handleSort,
    handleVehicleTypeFilterChange,
  };
};

export default useDriverVehicles;