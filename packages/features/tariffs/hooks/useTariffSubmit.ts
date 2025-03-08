import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Tariff, TariffOnService } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { TariffFormData } from './create/useTariffCreateForm';

interface UseTariffSubmitProps {
  mode: 'create' | 'edit';
  tariffData?: Tariff & { tariffAdditionalServices: TariffOnService[] };
}

export const useTariffSubmit = ({ mode, tariffData }: UseTariffSubmitProps) => {
  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: TariffFormData): Promise<void> => {
      try {
        const action = mode === 'create' ? 'создано' : 'обновлен';

        // Подготавливаем данные для отправки
        const payload = { ...data };

        // Отправляем JSON-payload на сервер (POST или PUT)
        const apiUrl = mode === 'create' ? '/api/tariffs' : `/api/tariffs/${tariffData?.uuid}`;
        const response = await fetch(apiUrl, {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage =
            errorData.error?.message || `Failed ${action} tariff: ${response.status}`;
          showToast.error(errorMessage);
          return;
        }

        showToast.success(`Тариф ${action} успешно!`);
        router.push(`/tariff-management`);
      } catch (error) {
        if (error instanceof Error) {
          showToast.error(error.message);
        }
      }
    },
    [mode, router, tariffData],
  );

  return { handleSubmit };
};

export default useTariffSubmit;
