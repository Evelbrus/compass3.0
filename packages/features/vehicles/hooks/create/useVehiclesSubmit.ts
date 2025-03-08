import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@shared/components/toast/ToastManager';
import { v4 as uuidv4 } from 'uuid';
import { VehicleData } from './useVehiclesCreateForm';

interface UseVehiclesSubmitProps {
  mode: 'create' | 'edit';
  vehicleData?: VehicleData;
}

export const useVehiclesSubmit = ({ mode, vehicleData }: UseVehiclesSubmitProps) => {
  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: VehicleData): Promise<void> => {
      try {
        let vehicleUuid = vehicleData?.uuid;
        const action = mode === 'create' ? 'создано' : 'обновлено';

        // Преобразуем vehicleDrivers в массив идентификаторов водителей (driverIds)
        const driverIds = data.vehicleDrivers?.map((item) => item.driver.uuid) || [];

        // Убираем поля, используемые только на клиенте: photoImage и vehicleDrivers
        const { photoImage, vehicleDrivers, ...vehicleDataRest } = data;
        let photoPath: string | null = vehicleData?.photoPath ?? null;

        // Если выбран файл, генерируем уникальное имя и формируем путь
        if (photoImage instanceof File) {
          const photoFilename = `${uuidv4()}-${photoImage.name}`;
          photoPath = `/vehicle/${photoFilename}`;
        }

        // Формируем payload для API: добавляем photoPath и driverIds
        const payload = { ...vehicleDataRest, photoPath, driverIds };
        if (mode === 'create') {
          vehicleUuid = uuidv4();
          payload.uuid = vehicleUuid;
        }

        // Отправляем JSON-payload на сервер (POST или PUT)
        const apiUrl = mode === 'create' ? '/api/vehicles' : `/api/vehicles/${vehicleData?.uuid}`;
        const response = await fetch(apiUrl, {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage =
            errorData.error?.message || `Failed ${action} vehicle: ${response.status}`;
          showToast.error(errorMessage);
          return;
        }

        const result = await response.json();
        vehicleUuid = result.uuid;

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
        }

        showToast.success(`Транспортное средство ${action} успешно!`);
        router.push(`/transfer-services`);
      } catch (error) {
        if (error instanceof Error) {
          showToast.error(error.message);
        }
      }
    },
    [mode, router, vehicleData],
  );

  return { handleSubmit };
};

export default useVehiclesSubmit;
