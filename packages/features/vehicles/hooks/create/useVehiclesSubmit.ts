'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@shared/components/toast/ToastManager';
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

        // Формируем payload для POST/PUT без photoPath
        const payload = { ...vehicleDataRest, driverIds };
        if (mode === 'edit' && vehicleUuid) {
          payload.uuid = vehicleUuid;
        }

        // 1. POST или PUT для создания/обновления автомобиля
        const apiUrl = mode === 'create' ? '/api/admin/vehicles' : `/api/admin/vehicles/${vehicleUuid}`;
        const response = await fetch(apiUrl, {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage =
            errorData.error?.message || `Failed ${action} vehicle: ${response.status}`;
          throw new Error(errorMessage);
        }

        const result = await response.json();
        vehicleUuid = result.uuid;
        if (!vehicleUuid) throw new Error('Сервер не вернул UUID автомобиля');

        // 2. UPLOAD фото, если оно есть
        let photoPath = null;
        if (photoImage instanceof File) {
          const uploadFormData = new FormData();
          uploadFormData.append('photoImage', photoImage);

          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json();
            const uploadErrorMessage =
              uploadError.error?.message || uploadError.message || 'Error uploading image';
            throw new Error(uploadErrorMessage);
          }

          const uploadData = await uploadResponse.json();
          photoPath = uploadData.filePaths.photoPath; // Получаем сгенерированный путь
        }

        // 3. PATCH для записи пути фото, если оно было загружено
        if (photoPath) {
          const patchPayload = { uuid: vehicleUuid, photoPath };
          const patchResponse = await fetch(`/api/admin/vehicles/${vehicleUuid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchPayload),
          });

          if (!patchResponse.ok) {
            const patchError = await patchResponse.json();
            const patchErrorMessage =
              patchError.error?.message || 'Error updating vehicle photo path';
            throw new Error(patchErrorMessage);
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
