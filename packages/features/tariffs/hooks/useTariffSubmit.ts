import React from 'react'
import { showToast } from '@shared/components/toast/ToastManager';
import { useRouter } from 'next/navigation';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';

export const useTariffSubmit = (formData: Partial<DetailTariffData>, mode: 'create' | 'edit') => {
  const router = useRouter();
  const isEdit = mode === 'edit';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const submissionData: Partial<DetailTariffData> = {
      ...formData,
      tariffAdditionalServices: formData.tariffAdditionalServices ?? [],
    };

    try {
      const response = await fetch(isEdit ? `/api/tariffs/${formData.uuid}` : '/api/tariffs', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error(`Ошибка сети: ${response.statusText}`);
      }

      const result = await response.json();
      if (result?.uuid) {
        showToast.success(`Тариф успешно ${isEdit ? 'обновлен' : 'создан'}`);
        router.push('/tariff-management/');
      } else {
        showToast.error('Не удалось выполнить перенаправление на страницу деталей тарифа');
      }
    } catch (error) {
      showToast.error(
        `Ошибка при ${isEdit ? 'обновлении' : 'создании'} тарифа: ${(error as Error).message}`,
      );
    }
  };

  return { handleSubmit };
};
