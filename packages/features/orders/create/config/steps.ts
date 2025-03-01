// src/features/orders/create/config/steps.ts
import { ReactNode } from 'react';

export interface OrderStepConfig {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode; // Опционально: можно добавить пользовательскую иконку для каждого шага
  isVisible?: boolean; // Для скрытия/отображения шага
}

// Типы шагов в системе
export type OrderStepType =
  | 'driver-selection'
  | 'client-selection'
  | 'tariff-services'
  | 'route-config'
  | 'route-info';

// Функция для получения конфигурации шагов
export const getOrderStepsConfig = (
  customConfig?: Partial<Record<OrderStepType, Partial<OrderStepConfig>>>,
  customOrder?: OrderStepType[],
): OrderStepConfig[] => {
  // Базовая конфигурация шагов
  const defaultStepsConfig: Record<OrderStepType, OrderStepConfig> = {
    'driver-selection': {
      id: 'driver-selection',
      title: 'Выбор водителя',
      description: 'Выберите подходящего водителя для поездки',
      isVisible: true,
    },
    'client-selection': {
      id: 'client-selection',
      title: 'Выбор клиента',
      description: 'Выберите существующего клиента или создайте нового',
      isVisible: true,
    },
    'tariff-services': {
      id: 'tariff-services',
      title: 'Тариф и дополнительные услуги',
      description: 'Настройте тариф и выберите дополнительные услуги',
      isVisible: true,
    },
    'route-config': {
      id: 'route-config',
      title: 'Настройка маршрута',
      description: 'Задайте точки отправления, прибытия и промежуточные остановки',
      isVisible: true,
    },
    'route-info': {
      id: 'route-info',
      title: 'Информация о маршруте',
      description: 'Просмотр информации о маршруте и сводки по заказу',
      isVisible: true,
    },
  };

  // Применяем пользовательские настройки, если они предоставлены
  if (customConfig) {
    Object.entries(customConfig).forEach(([stepType, config]) => {
      if (stepType in defaultStepsConfig) {
        defaultStepsConfig[stepType as OrderStepType] = {
          ...defaultStepsConfig[stepType as OrderStepType],
          ...config,
        };
      }
    });
  }

  // Определяем порядок шагов
  const defaultStepsOrder: OrderStepType[] = [
    'driver-selection',
    'client-selection',
    'tariff-services',
    'route-config',
    'route-info',
  ];

  // Используем пользовательский порядок, если он предоставлен
  const stepsOrder = customOrder || defaultStepsOrder;

  // Возвращаем только видимые шаги в указанном порядке
  return stepsOrder
    .map((stepType) => defaultStepsConfig[stepType])
    .filter((step) => step.isVisible !== false);
};

