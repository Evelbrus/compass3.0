import React, { JSX } from 'react';
import { DriverAcceptanceStatus, OrderStatus, UserRole } from '@prisma/client';

/**
 * Получение иконки для соответствующего этапа заказа
 * @param stage - Текущий статус принятия заказа водителем
 * @returns JSX.Element - SVG иконка, соответствующая статусу
 */
export const getStageIcon = (stage: DriverAcceptanceStatus): JSX.Element => {
  switch (stage) {
    case DriverAcceptanceStatus.PENDING:
    case DriverAcceptanceStatus.TAKEN:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case DriverAcceptanceStatus.ACCEPTED:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case DriverAcceptanceStatus.ON_THE_WAY:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      );
    case DriverAcceptanceStatus.ARRIVED:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      );
    case DriverAcceptanceStatus.PICKED_UP:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    case DriverAcceptanceStatus.COMPLETED:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case DriverAcceptanceStatus.TIMEOUT:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
  }
};

/**
 * Получение порядкового номера текущего этапа
 * @param currentStage - Текущий статус принятия заказа водителем
 * @returns number - Порядковый номер этапа (1-7)
 */
export const getStageIndex = (currentStage: DriverAcceptanceStatus): number => {
  const validStages = [
    DriverAcceptanceStatus.PENDING,
    DriverAcceptanceStatus.TAKEN,
    DriverAcceptanceStatus.ACCEPTED,
    DriverAcceptanceStatus.ON_THE_WAY,
    DriverAcceptanceStatus.ARRIVED,
    DriverAcceptanceStatus.PICKED_UP,
    DriverAcceptanceStatus.COMPLETED,
    DriverAcceptanceStatus.TIMEOUT,
  ];
  const currentIndex = validStages.indexOf(currentStage);
  return currentIndex > -1 ? currentIndex + 1 : 1;
};

/**
 * Получение градиента фона заголовка в зависимости от статуса заказа
 * @param orderStatus - Статус заказа
 * @returns string - CSS-класс для фона заголовка
 */
export const getHeaderBackground = (orderStatus: OrderStatus): string => {
  switch (orderStatus) {
    case OrderStatus.CANCELLED:
      return 'bg-gradient-to-r from-red-600 to-red-800';
    case OrderStatus.COMPLETED:
      return 'bg-gradient-to-r from-green-600 to-green-800';
    case OrderStatus.OVERDUE:
      return 'bg-gradient-to-r from-yellow-600 to-yellow-800';
    case OrderStatus.IN_PROGRESS:
      return 'bg-gradient-to-r from-blue-600 to-blue-800';
    case OrderStatus.PLANNED:
      return 'bg-gradient-to-r from-indigo-600 to-indigo-800';
    case OrderStatus.PENDING:
    default:
      return 'bg-gradient-to-r from-blue-600 to-blue-800';
  }
};

/**
 * Рассчитывает процент прогресса поездки
 * @param currentStage - Текущий статус принятия заказа водителем
 * @returns number - Процент прогресса (0-100)
 */
export const calculateProgress = (currentStage: DriverAcceptanceStatus): number => {
  const validStages = [
    DriverAcceptanceStatus.PENDING,
    DriverAcceptanceStatus.TAKEN,
    DriverAcceptanceStatus.ACCEPTED,
    DriverAcceptanceStatus.ON_THE_WAY,
    DriverAcceptanceStatus.ARRIVED,
    DriverAcceptanceStatus.PICKED_UP,
    DriverAcceptanceStatus.COMPLETED,
    DriverAcceptanceStatus.TIMEOUT,
  ];

  const currentIndex = validStages.indexOf(currentStage);
  if (currentIndex !== -1) {
    return Math.round((currentIndex / (validStages.length - 1)) * 100);
  } else {
    return 0; // Для TIMEOUT или других неучтенных статусов
  }
};

/**
 * Преобразование статуса водителя в статус заказа
 * @param driverStatus - Статус принятия заказа водителем
 * @returns OrderStatus - Соответствующий статус заказа
 */
export const driverStatusToOrderStatus: Record<DriverAcceptanceStatus, OrderStatus> = {
  [DriverAcceptanceStatus.PENDING]: OrderStatus.PENDING,
  [DriverAcceptanceStatus.TAKEN]: OrderStatus.PENDING,
  [DriverAcceptanceStatus.ACCEPTED]: OrderStatus.IN_PROGRESS,
  [DriverAcceptanceStatus.ON_THE_WAY]: OrderStatus.IN_PROGRESS,
  [DriverAcceptanceStatus.ARRIVED]: OrderStatus.IN_PROGRESS,
  [DriverAcceptanceStatus.PICKED_UP]: OrderStatus.IN_PROGRESS,
  [DriverAcceptanceStatus.COMPLETED]: OrderStatus.COMPLETED,
  [DriverAcceptanceStatus.TIMEOUT]: OrderStatus.OVERDUE,
};

/**
 * Определяет, доступна ли отмена заказа
 * @param currentStage - Текущий статус принятия заказа водителем
 * @param userRole - Роль пользователя
 * @returns boolean - Можно ли отменить заказ
 */
export const canCancelOrder = (
  currentStage: DriverAcceptanceStatus,
  userRole: UserRole,
): boolean => {
  if (userRole === UserRole.ClientCorp) {
    // Клиент может отменить заказ до тех пор, пока водитель не начал поездку
    return (
      currentStage === DriverAcceptanceStatus.PENDING ||
      currentStage === DriverAcceptanceStatus.TAKEN ||
      currentStage === DriverAcceptanceStatus.ACCEPTED ||
      currentStage === DriverAcceptanceStatus.ON_THE_WAY ||
      currentStage === DriverAcceptanceStatus.ARRIVED ||
      currentStage === DriverAcceptanceStatus.COMPLETED
    );
  } else if (userRole === UserRole.Driver) {
    // Водитель может отменить заказ до тех пор, пока не начал поездку
    return currentStage === DriverAcceptanceStatus.COMPLETED;
  }

  return false;
};

/**
 * Определяет, отменен ли заказ
 * @param orderStatus - Статус заказа
 * @returns boolean - Отменен ли заказ
 */
export const isOrderCancelled = (orderStatus: OrderStatus): boolean => {
  return orderStatus === OrderStatus.CANCELLED;
};
