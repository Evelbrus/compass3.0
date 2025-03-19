'use client';

import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Vehicle, User, VehicleDriver } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { fetchDrivers } from '@features/vehicles/api/vehicles.api';
import { checkAndHandleRedirect } from '@shared/api'; // Добавляем импорт

export interface VehicleData extends Omit<Vehicle, 'photoPath'> {
  photoImage?: File | null;
  photoPath: string | null;
  vehicleDrivers: (VehicleDriver & { driver: User })[];
}

interface UseVehiclesFormProps {
  vehicleData?: VehicleData;
}

export const useVehiclesCreateForm = ({ vehicleData }: UseVehiclesFormProps) => {
  const formMethods: UseFormReturn<VehicleData> = useForm<VehicleData>({
    mode: 'onSubmit',
    defaultValues: vehicleData || { vehicleDrivers: [] },
  });
  const { watch, setValue } = formMethods;

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    vehicleData?.photoPath
      ? `/api/images/${encodeURIComponent(vehicleData.photoPath.split('/').pop()!)}?type=vehicle`
      : null,
  );

  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const perPage = 10;

  const hasSelectedDrivers = (watch('vehicleDrivers')?.length || 0) > 0;
  const observerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadDrivers(true);
  }, [debouncedSearch]);

  const loadDrivers = useCallback(
    async (reset = false) => {
      if (loading) return;
      const currentPage = reset ? 1 : page;
      if (!hasMore && !reset) return;
      setLoading(true);
      try {
        const response = await fetchDrivers(
          null,
          undefined,
          debouncedSearch,
          String(currentPage),
          String(perPage),
        );

        // Добавляем проверку на редирект
        if (checkAndHandleRedirect(response)) {
          return; // Прерываем выполнение если произошел редирект
        }

        const fetchedDrivers = response.data.users || [];
        const newTotal = response.total;
        const totalPages = Math.ceil(newTotal / perPage);

        if (reset) {
          setDrivers(fetchedDrivers as User[]);
          setPage(2);
        } else {
          setDrivers((prev) => [...prev, ...fetchedDrivers] as User[]);
          setPage(currentPage + 1);
        }

        setTotal(newTotal);
        if (currentPage >= totalPages || fetchedDrivers.length < perPage) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Ошибка загрузки водителей:', error);
        showToast.error('Не удалось загрузить список водителей');
      } finally {
        setLoading(false);
      }
    },
    [loading, page, perPage, hasMore, debouncedSearch],
  );

  useEffect(() => {
    loadDrivers(true);
  }, []);

  useEffect(() => {
    const watchedPhotoFile = watch('photoImage');
    if (watchedPhotoFile && watchedPhotoFile instanceof File) {
      const url = URL.createObjectURL(watchedPhotoFile);
      setPreviewImage(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watch('photoImage')]);

  const onSelectDriver = (driver: User) => {
    const currentDrivers: (VehicleDriver & { driver: User })[] = watch('vehicleDrivers') || [];
    if (!currentDrivers.some((d) => d.driver.uuid === driver.uuid)) {
      setValue('vehicleDrivers', [
        ...currentDrivers,
        { driver } as VehicleDriver & { driver: User },
      ]);
    } else {
      showToast.info('Водитель уже выбран');
    }
  };

  const onRemoveDriver = (uuid: string) => {
    const currentDrivers: (VehicleDriver & { driver: User })[] = watch('vehicleDrivers') || [];
    setValue(
      'vehicleDrivers',
      currentDrivers.filter((d) => d.driver.uuid !== uuid),
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleGoToDriverSelection = () => {
    setShowWarningModal(false);
  };

  useEffect(() => {
    if (!observerRef.current || !scrollContainerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loading && hasMore) {
            loadDrivers();
          }
        });
      },
      { root: scrollContainerRef.current, rootMargin: '100px' },
    );
    observer.observe(observerRef.current);
    return () => {
      observer.disconnect();
    };
  }, [loading, hasMore, loadDrivers]);

  return {
    formMethods,
    previewImage,
    drivers,
    loading,
    total,
    searchTerm,
    handleSearchChange,
    onSelectDriver,
    onRemoveDriver,
    observerRef,
    scrollContainerRef,
    showWarningModal,
    setShowWarningModal,
    hasSelectedDrivers,
    handleGoToDriverSelection,
  };
};

export default useVehiclesCreateForm;
