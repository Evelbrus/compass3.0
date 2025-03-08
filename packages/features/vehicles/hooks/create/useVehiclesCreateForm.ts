'use client';

import React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Vehicle, User, VehicleDriver } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { fetchDrivers } from '@features/vehicles/api/vehicles.api';

/**
 * Интерфейс для данных автомобиля, используемых в форме.
 * Поле vehicleDrivers представляет массив объектов, в которых обязательно есть driver типа User.
 */
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

  // Состояния для модальных окон
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Предпросмотр изображения: если уже имеется сохранённый путь, формируем URL
  const [previewImage, setPreviewImage] = useState<string | null>(
    vehicleData?.photoPath
      ? `/api/images/${encodeURIComponent(vehicleData.photoPath.split('/').pop()!)}?type=vehicle`
      : null,
  );

  // Состояния для списка доступных водителей
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const perPage = 10;

  // Проверка наличия выбранных водителей
  const hasSelectedDrivers = (watch('vehicleDrivers')?.length || 0) > 0;

  // Рефы для бесконечной прокрутки списка водителей
  const observerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Debounce механизм для поискового запроса
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Сброс и загрузка водителей при изменении поискового запроса
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    loadDrivers(true);
  }, [debouncedSearch]);

  /**
   * Функция загрузки водителей.
   * Если reset=true – сбрасываем страницу и загружаем первую страницу,
   * иначе – подгружаем данные для текущей страницы.
   */
  const loadDrivers = useCallback(
    async (reset = false) => {
      if (loading) return;
      const currentPage = reset ? 1 : page;
      if (!hasMore && !reset) return;
      setLoading(true);
      try {
        // Отправляем запрос
        const response = await fetchDrivers(
          null, // serviceLevel
          undefined, // vehicleType
          debouncedSearch, // searchQuery
          String(currentPage),
          String(perPage),
        );

        // Получаем водителей из response.data.users
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

  // Первоначальная загрузка водителей при монтировании компонента
  useEffect(() => {
    loadDrivers(true);
  }, []);

  // Обновление предпросмотра изображения при выборе нового файла
  useEffect(() => {
    const watchedPhotoFile = watch('photoImage');
    if (watchedPhotoFile && watchedPhotoFile instanceof File) {
      const url = URL.createObjectURL(watchedPhotoFile);
      setPreviewImage(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watch('photoImage')]);

  // Обработчик выбора водителя — используем поле vehicleDrivers
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

  // Обработчик удаления водителя
  const onRemoveDriver = (uuid: string) => {
    const currentDrivers: (VehicleDriver & { driver: User })[] = watch('vehicleDrivers') || [];
    setValue(
      'vehicleDrivers',
      currentDrivers.filter((d) => d.driver.uuid !== uuid),
    );
  };

  // Обработчик изменения поискового запроса
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Перейти к выбору водителя
  const handleGoToDriverSelection = () => {
    setShowWarningModal(false);
  };

  // Intersection Observer для бесконечной прокрутки списка водителей
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
