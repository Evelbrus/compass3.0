// app/src/utils/generateOrderNumber.ts
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const logError = debug('app:utils:orderNumber:error');

/**
 * Генерирует уникальный номер заказа в формате:
 * - Первая буква: тип автомобиля (S - Sedan, V - Van, ...)
 * - Вторая буква: класс обслуживания (E - Economy, C - Comfort, B - Business, ...)
 * - 5 цифр: порядковый номер
 *
 * @param vehicleType Тип автомобиля
 * @param serviceLevel Класс обслуживания
 */
export async function generateOrderNumber(
  vehicleType: string,
  serviceLevel: string,
): Promise<string> {
  try {
    // Маппинг типа автомобиля на первую букву
    const vehicleTypeMap: Record<string, string> = {
      Sedan: 'S',
      Van: 'V',
      Minibus: 'M',
      Bus: 'B',
      Premium: 'P',
      // Добавьте другие типы автомобилей по необходимости
    };

    // Маппинг класса обслуживания на вторую букву
    const serviceLevelMap: Record<string, string> = {
      Economy: 'E',
      Comfort: 'C',
      Business: 'B',
      Premium: 'P',
      VIP: 'V',
      // Добавьте другие классы обслуживания по необходимости
    };

    // Получаем соответствующие буквы или используем значения по умолчанию
    const vehicleLetter = vehicleTypeMap[vehicleType] || 'X';
    const serviceLetter = serviceLevelMap[serviceLevel] || 'X';

    // Получаем последний номер заказа из базы данных, который начинается с этих букв
    const prefix = `${vehicleLetter}${serviceLetter}`;
    const lastOrder = await prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        orderNumber: 'desc',
      },
    });

    // Если найден заказ с таким префиксом, увеличиваем номер на 1
    let nextNumber = 1;
    if (lastOrder?.orderNumber) {
      const numPart = lastOrder.orderNumber.substring(2); // Получаем числовую часть
      nextNumber = parseInt(numPart, 10) + 1;
    }

    // Форматируем число с лидирующими нулями до 5 цифр
    const paddedNumber = nextNumber.toString().padStart(5, '0');

    // Генерируем финальный номер заказа
    const orderNumber = `${prefix}${paddedNumber}`;

    return orderNumber;
  } catch (error) {
    logError('× Ошибка при генерации номера заказа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    // Возвращаем запасной вариант в случае ошибки
    return `XX${Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, '0')}`;
  }
}
