//hooks/useAvailabilityUpdater.ts
import { useState } from 'react';
import { showToast } from '@shared/components/toast/ToastManager';

interface UpdateAvailabilityResponse {
  uuid: string;
  isAvailable: boolean;
}

/**
 * Хук для обновления доступности автомобиля.
 * При вызове функции updateAvailability отправляется PATCH-запрос на сервер,
 * обновляющий поле isAvailable.
 */
export const useAvailabilityUpdater = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const updateAvailability = async (
    vehicleUuid: string,
    isAvailable: boolean,
  ): Promise<UpdateAvailabilityResponse | null> => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/vehicles/car-availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: vehicleUuid, isAvailable }),
      });

      const result = await response.json();
      if (!response.ok) {
        showToast.error(result.error?.message || 'Ошибка обновления доступности');
        return null;
      }
      showToast.success('Доступность обновлена');
      return result.data;
    } catch (error) {
      console.error('Ошибка обновления доступности:', error);
      showToast.error('Ошибка обновления доступности');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateAvailability, loading };
};
