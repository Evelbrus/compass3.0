import { useState, useEffect, useRef } from 'react';
import { Decimal } from 'decimal.js';

interface UseTotalPriceProps {
  tariffPrice: Decimal | null;
  additionalServicesPrice: Decimal | null;
  waitTimeCost: Decimal | null;
  routeCost: Decimal | null;
  initialBasePrice?: Decimal | null;
}

// Расширенный интерфейс возвращаемого значения
interface UseTotalPriceReturn {
  totalPrice: Decimal;
  handleEditPrice: (price: number) => void;
  resetPrice: () => void;
  priceComponents: {
    tariffPrice: Decimal | null;
    additionalServicesPrice: Decimal | null;
    waitTimeCost: Decimal | null;
    routeCost: Decimal | null;
  };
  priceMode: 'base' | 'manual' | 'auto';
  isPriceEdited: boolean; // Добавленный флаг, показывающий, отличается ли цена от автоматически рассчитанной
}

const useTotalPrice = ({
  tariffPrice,
  additionalServicesPrice,
  waitTimeCost,
  routeCost,
  initialBasePrice,
}: UseTotalPriceProps): UseTotalPriceReturn => {
  // Состояние, указывающее режим цены: "base" (из orderData), "manual" (вручную), "auto" (расчетная)
  const [priceMode, setPriceMode] = useState<'base' | 'manual' | 'auto'>(
    initialBasePrice ? 'base' : 'auto',
  );

  // Ручная цена
  const [manualPrice, setManualPrice] = useState<Decimal | null>(null);

  // Флаг первичной инициализации
  const isInitializedRef = useRef(false);

  // Запоминаем последние значения компонентов для сравнения
  const prevComponentsRef = useRef<string>('');

  // Вычисленная итоговая цена
  const [calculatedTotal, setCalculatedTotal] = useState<Decimal>(
    initialBasePrice || new Decimal(0),
  );

  // Флаг, показывающий, отличается ли текущая цена от автоматически рассчитанной
  const [isPriceEdited, setIsPriceEdited] = useState<boolean>(false);

  // Функция для расчета общей цены на основе компонентов
  const calculateAutoPrice = (): Decimal => {
    let result = new Decimal(0);

    if (tariffPrice) result = result.plus(tariffPrice);
    if (additionalServicesPrice) result = result.plus(additionalServicesPrice);
    if (waitTimeCost) result = result.plus(waitTimeCost);
    if (routeCost) result = result.plus(routeCost);

    return result;
  };

  // Функция для проверки, отличается ли цена от автоматически рассчитанной
  const checkIfPriceEdited = (currentPrice: Decimal) => {
    const autoPrice = calculateAutoPrice();
    // Проверяем с погрешностью в 0.01 (округляем до 2 знаков после запятой)
    return !currentPrice.toDecimalPlaces(2).equals(autoPrice.toDecimalPlaces(2));
  };

  // Первичная инициализация
  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;

      if (initialBasePrice) {
        setManualPrice(initialBasePrice);
        setCalculatedTotal(initialBasePrice);
        // Проверяем, отличается ли начальная базовая цена от рассчитанной
        setIsPriceEdited(checkIfPriceEdited(initialBasePrice));
      } else {
        const autoPrice = calculateAutoPrice();
        setCalculatedTotal(autoPrice);
        setIsPriceEdited(false);
      }
    }
  }, [initialBasePrice]);

  // Обновление цены при изменении компонентов
  useEffect(() => {
    // Создаем строковое представление текущих компонентов
    const currentComponents = JSON.stringify({
      tariff: tariffPrice ? tariffPrice.toString() : null,
      services: additionalServicesPrice ? additionalServicesPrice.toString() : null,
      wait: waitTimeCost ? waitTimeCost.toString() : null,
      route: routeCost ? routeCost.toString() : null,
    });

    // Проверяем, изменились ли компоненты
    if (currentComponents !== prevComponentsRef.current) {
      prevComponentsRef.current = currentComponents;

      // Обновляем автоматическую цену и проверку на редактирование
      const autoPrice = calculateAutoPrice();

      // Обновляем цену только в режиме auto
      if (priceMode === 'auto') {
        setCalculatedTotal(autoPrice);
        setIsPriceEdited(false);
      } else {
        // Проверяем, отличается ли текущая цена от автоматически рассчитанной
        setIsPriceEdited(checkIfPriceEdited(calculatedTotal));
      }
    }
  }, [tariffPrice, additionalServicesPrice, waitTimeCost, routeCost, priceMode, calculatedTotal]);

  // Обработчик для ручного изменения цены
  const handleEditPrice = (price: number): void => {
    const newPrice = new Decimal(price);
    setManualPrice(newPrice);
    setCalculatedTotal(newPrice);
    setPriceMode('manual');
    // Проверяем, отличается ли новая цена от автоматически рассчитанной
    setIsPriceEdited(checkIfPriceEdited(newPrice));
  };

  // Обработчик для сброса к автоматическому расчету
  const resetPrice = (): void => {
    const autoPrice = calculateAutoPrice();
    setPriceMode('auto');
    setManualPrice(null);
    setCalculatedTotal(autoPrice);
    setIsPriceEdited(false);
  };

  return {
    totalPrice: calculatedTotal,
    handleEditPrice,
    resetPrice,
    priceComponents: {
      tariffPrice,
      additionalServicesPrice,
      waitTimeCost,
      routeCost,
    },
    priceMode,
    isPriceEdited,
  };
};

export default useTotalPrice;
