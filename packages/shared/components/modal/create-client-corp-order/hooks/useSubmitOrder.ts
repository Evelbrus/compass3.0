import { useState } from 'react';
import { Decimal } from 'decimal.js';
import { CreateClientCorpOrderData } from '@shared/components/modal/create-client-corp-order/hooks/useCreateClientCorpOrder';

interface UseSubmitOrderParams {
  selectedTariff: { uuid: string } | null;
  departurePoint?: string;
  arrivalPoint?: string;
  additionalPoints?: string[];
  selectedServices?: string[];
  totalPrice: Decimal;
}

const useSubmitOrder = () => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const submitOrder = async ({
    selectedTariff,
    departurePoint,
    arrivalPoint,
    additionalPoints,
    selectedServices,
    totalPrice,
    ...formData
  }: UseSubmitOrderParams &
    Omit<
      CreateClientCorpOrderData,
      'tariffUuid' | 'departurePoint' | 'arrivalPoint' | 'createdBy'
    >) => {
    if (!selectedTariff || !departurePoint || !arrivalPoint) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const orderData: Omit<CreateClientCorpOrderData, 'createdBy'> = {
      tariffUuid: selectedTariff.uuid,
      departurePoint,
      arrivalPoint,
      intermediatePoints: additionalPoints || [],
      selectedServices: selectedServices || [],
      basePrice: totalPrice.toNumber(),
      ...formData,
    };

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/client-corp/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке заказа');
      }

      const result = await response.json();
      console.log('Заказ создан:', result);
    } catch (err) {
      setError(err.message);
      console.error('Ошибка:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitOrder, isSubmitting, error };
};

export default useSubmitOrder;
