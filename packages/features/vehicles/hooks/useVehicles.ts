'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { VehicleType, Vehicle, VehicleDriver, User } from '@prisma/client';
import { TableVehicleRow } from '@shared/components/ui/table';
import {
  renderVehicleActions,
} from '@shared/components/ui/table/ui/TableRenders';
import { formatDate } from '@shared/components/ui/inputs/date/functions/formatDate';

type VehicleWithDrivers = Vehicle & {
  vehicleDrivers: (VehicleDriver & { driver: User | null })[];
};

const useVehicles = () => {
  const searchParams = useSearchParams();

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

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const url = new URL('/api/vehicles', window.location.origin);
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
      url.searchParams.append(
        'include',
        JSON.stringify({ vehicleDrivers: { include: { driver: true } } }),
      );

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error('Сетевой ответ был неудачным');
      const { status, message, data } = await response.json();
      if (status !== 'success') throw new Error(message);

      setVehicles(data.vehicles || []);
      setTotal(data.total);
      setTotalAllVehicles(data.totalAllVehicles);

      const vehicleTypeCountsData: Record<string, number> = { all: data.totalAllVehicles };
      data.vehicleTypeCounts?.forEach((item: { type: VehicleType; count: number }) => {
        vehicleTypeCountsData[item.type] = item.count;
      });
      setVehicleTypeCounts(vehicleTypeCountsData);
      setError(null);
    } catch (error) {
      console.error('Ошибка при получении транспортных средств:', error);
      setError('Ошибка при получении транспортных средств');
    } finally {
      setLoading(false);
    }
  }, [page, perPage, vehicleTypeFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

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
    year: vehicle.year ? formatDate(vehicle.year) : 'N/A',
    color: vehicle.color,
    plateNumber: vehicle.plateNumber,
    isAvailable: vehicle.isAvailable ? 'Yes' : 'No',
    vehicleInfo: {
      vehicleType: vehicle.vehicleType,
      serviceLevels: vehicle.serviceLevels || 'N/A',
    },
    driverInfo: vehicle.vehicleDrivers?.[0]?.driver
      ? {
          phone: vehicle.vehicleDrivers[0].driver.phone || 'Не указано',
          fullName: vehicle.vehicleDrivers[0].driver.fullName || 'Не указано',
        }
      : null,
    createdAt: formatDate(vehicle.createdAt),
    updatedAt: formatDate(vehicle.updatedAt),
    actions: renderVehicleActions({ entity: 'vehicles', uuid: vehicle.uuid }),
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

export default useVehicles;
