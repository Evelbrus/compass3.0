  import { useMemo, useState, useCallback } from 'react';
  import Decimal from 'decimal.js';

  export interface UseTotalPriceParams {
    tariffPrice?: Decimal | number | null;
    additionalServicesPrice?: Decimal | number | null;
    waitTimeCost?: Decimal | number | null;
    routeCost?: Decimal | number | null;
  }

  interface UseTotalPriceResult {
    totalPrice: Decimal;
    calculatedPrice: Decimal;
    isCustomPrice: boolean;
    handleEditPrice: (price: number) => void;
    resetPrice: () => void;
    priceComponents: {
      tariffPrice: Decimal;
      additionalServicesPrice: Decimal;
      waitTimeCost: Decimal;
      routeCost: Decimal;
    };
  }

  const useTotalPrice = ({
    tariffPrice,
    additionalServicesPrice,
    waitTimeCost,
    routeCost,
  }: UseTotalPriceParams): UseTotalPriceResult => {
    // Переводим все значения в Decimal или 0
    const basePrice = useMemo(
      () => (tariffPrice ? new Decimal(tariffPrice) : new Decimal(0)),
      [tariffPrice],
    );

    const servicesPrice = useMemo(
      () => (additionalServicesPrice ? new Decimal(additionalServicesPrice) : new Decimal(0)),
      [additionalServicesPrice],
    );

    const waitPrice = useMemo(
      () => (waitTimeCost ? new Decimal(waitTimeCost) : new Decimal(0)),
      [waitTimeCost],
    );

    const routePrice = useMemo(
      () => (routeCost ? new Decimal(routeCost) : new Decimal(0)),
      [routeCost],
    );

    // Рассчитываем итоговую цену
    const calculatedPrice = useMemo(() => {
      return basePrice.plus(servicesPrice).plus(waitPrice).plus(routePrice);
    }, [basePrice, servicesPrice, waitPrice, routePrice]);

    // Состояние для пользовательской (отредактированной) цены
    const [customPrice, setCustomPrice] = useState<Decimal | null>(null);

    // Определяем, используется ли кастомная цена
    const isCustomPrice = useMemo(() => customPrice !== null, [customPrice]);

    // Возвращаем либо кастомную цену, либо рассчитанную
    const totalPrice = useMemo(() => {
      return customPrice !== null ? customPrice : calculatedPrice;
    }, [customPrice, calculatedPrice]);

    // Функция для установки пользовательской цены
    const handleEditPrice = useCallback((price: number) => {
      setCustomPrice(new Decimal(price));
    }, []);

    // Функция для сброса до рассчитанной цены
    const resetPrice = useCallback(() => {
      setCustomPrice(null);
    }, []);

    // Возвращаем все необходимые значения и функции
    return {
      totalPrice, // Итоговая цена (пользовательская или рассчитанная)
      calculatedPrice, // Цена, рассчитанная системой
      isCustomPrice, // Флаг, указывающий, что цена была изменена вручную
      handleEditPrice, // Функция для изменения цены
      resetPrice, // Функция для сброса до рассчитанной цены
      priceComponents: {
        // Компоненты цены для детализации
        tariffPrice: basePrice,
        additionalServicesPrice: servicesPrice,
        waitTimeCost: waitPrice,
        routeCost: routePrice,
      },
    };
  };

  export default useTotalPrice;
