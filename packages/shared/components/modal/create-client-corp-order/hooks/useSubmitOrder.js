import { useState } from 'react';
const useSubmitOrder = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const submitOrder = async ({ selectedTariff, departurePoint, arrivalPoint, additionalPoints, selectedServices, totalPrice, ...formData }) => {
        if (!selectedTariff || !departurePoint || !arrivalPoint) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }
        const orderData = {
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
        }
        catch (err) {
            //Проверка типа ошибки
            if (err instanceof Error) {
                setError(err.message);
                console.error('Ошибка:', err);
            }
            else {
                setError('Неизвестная ошибка');
                console.error('Неизвестная ошибка:', err);
            }
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return { submitOrder, isSubmitting, error };
};
export default useSubmitOrder;
