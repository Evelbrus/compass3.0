'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { showToast } from '@shared/components/toast/ToastManager';
import { v4 as uuidv4 } from 'uuid';
import { Vehicle, User, VehicleDriver } from '@prisma/client';
import { fetchDrivers } from '@features/vehicles/api/vehicles.api';

/**
 * Интерфейс для данных автомобиля, используемых в форме.
 * Поле vehicleDrivers представляет массив объектов, в которых обязательно есть driver типа User.
 */
export interface VehicleData extends Omit<Vehicle, 'photoPath' | 'year'> {
  photoImage?: File | null;
  photoPath: string | null;
  year: string;
  vehicleDrivers: (VehicleDriver & { driver: User })[];
}

interface UseVehiclesFormProps {
  mode: 'create' | 'edit';
  vehicleData?: VehicleData;
}

export const useVehiclesForm = ({ mode, vehicleData }: UseVehiclesFormProps) => {
  const formMethods: UseFormReturn<VehicleData> = useForm<VehicleData>({
    mode: 'onSubmit',
    defaultValues: vehicleData || { vehicleDrivers: [] },
  });
  const { control, handleSubmit, watch, setValue } = formMethods;
  const router = useRouter();

  //Предпросмотр изображения: если уже имеется сохранённый путь, формируем URL
  const [previewImage, setPreviewImage] = useState<string | null>(
    vehicleData?.photoPath
      ? `/api/images/${encodeURIComponent(vehicleData.photoPath.split('/').pop()!)}?type=vehicle`
      : null,
  );

  //Состояния для списка доступных водителей (например, грузится отдельно)
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const perPage = 10;

  //Рефы для бесконечной прокрутки списка водителей
  const observerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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
        const response = await fetchDrivers(
          '',
          String(currentPage),
          String(perPage),
          'createdAt',
          'asc',
        );
        const fetchedDrivers = response.data.users;
        const newTotal = response.total;
        const totalPages = Math.ceil(newTotal / perPage);
        if (reset) {
          setDrivers(fetchedDrivers);
          setPage(2);
        } else {
          setDrivers((prev) => [...prev, ...fetchedDrivers]);
          setPage(currentPage + 1);
        }
        setTotal(newTotal);
        if (currentPage >= totalPages || fetchedDrivers.length < perPage) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Ошибка загрузки водителей:', error);
      } finally {
        setLoading(false);
      }
    },
    [loading, page, perPage, hasMore],
  );

  //Обновление предпросмотра изображения при выборе нового файла
  useEffect(() => {
    const watchedPhotoFile = watch('photoImage');
    if (watchedPhotoFile && watchedPhotoFile instanceof File) {
      const url = URL.createObjectURL(watchedPhotoFile);
      setPreviewImage(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watch('photoImage')]);

  //Обработчик выбора водителя — используем поле vehicleDrivers
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

  //Обработчик удаления водителя
  const onRemoveDriver = (uuid: string) => {
    const currentDrivers: (VehicleDriver & { driver: User })[] = watch('vehicleDrivers') || [];
    setValue(
      'vehicleDrivers',
      currentDrivers.filter((d) => d.driver.uuid !== uuid),
    );
  };

  //Intersection Observer для бесконечной прокрутки списка водителей
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

  /**
   * Финальный сабмит формы.
   * Сначала отправляем данные автомобиля (без лишних полей),
   * затем, если выбран файл, отправляем его через FormData.
   *
   * При этом поле vehicleDrivers (массив объектов с полем driver типа User)
   * преобразуется в driverIds.
   */
  const onSubmit = useCallback(
    async (data: VehicleData): Promise<void> => {
      try {
        let vehicleUuid = vehicleData?.uuid;
        const action = mode === 'create' ? 'created' : 'updated';

        //Преобразуем vehicleDrivers в массив идентификаторов водителей (driverIds)
        const driverIds = data.vehicleDrivers?.map((item) => item.driver.uuid) || [];

        //Убираем поля, используемые только на клиенте: photoImage и vehicleDrivers
        const { photoImage, vehicleDrivers, ...vehicleDataRest } = data;
        let photoPath: string | null = vehicleData?.photoPath ?? null;

        //Если выбран файл, генерируем уникальное имя и формируем путь
        if (photoImage instanceof File) {
          const photoFilename = `${uuidv4()}-${photoImage.name}`;
          photoPath = `/vehicle/${photoFilename}`;
        }

        //Формируем payload для API: добавляем photoPath и driverIds
        const payload = { ...vehicleDataRest, photoPath, driverIds };
        if (mode === 'create') {
          vehicleUuid = uuidv4();
          payload.uuid = vehicleUuid;
        }

        //Отправляем JSON‑payload на сервер (POST или PUT)
        const apiUrl = mode === 'create' ? '/api/vehicles' : `/api/vehicles/${vehicleData?.uuid}`;
        const response = await fetch(apiUrl, {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          //Читаем данные ошибки из ответа
          const errorData = await response.json();
          //Если структура ошибки такая как в примере:
          //{ error: { message: "Водитель уже привязан к другому автомобилю.", fullName: "Alice Driver" } }
          const errorMessage =
            errorData.error?.message || `Failed ${action} vehicle: ${response.status}`;
          //Показываем сообщение через toast и завершаем выполнение функции
          showToast.error(errorMessage);
          return;
        }

        const result = await response.json();
        vehicleUuid = result.uuid;

        //Если выбран файл, отправляем его через FormData на /api/upload
        if (photoImage instanceof File && photoPath) {
          const formData = new FormData();
          formData.append('photoImage', photoImage);
          formData.append('photoPath', photoPath);
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json();
            const uploadErrorMessage =
              uploadError.error?.message || uploadError.message || 'Error uploading image';
            showToast.error(uploadErrorMessage);
            return;
          }
          const uploadResult = await uploadResponse.json();
          console.log('Upload result:', uploadResult);
        }

        showToast.success(`Vehicle ${action} successfully!`);
        router.push(`/transfer-services/detail/${vehicleUuid}`);
      } catch (error) {
        if (error instanceof Error) {
          showToast.error(error.message);
        }
      }
    },
    [mode, router, vehicleData, watch, setValue],
  );

  return {
    formMethods,
    control,
    handleSubmit,
    previewImage,
    setPreviewImage,
    drivers,
    onSelectDriver,
    onRemoveDriver,
    observerRef,
    scrollContainerRef,
    onSubmit,
  };
};

export default useVehiclesForm;
