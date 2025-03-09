// app/src/services/tariffs/updateTariff.ts
import { Tariff } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';
import debug from 'debug';
import { UpdateTariffDTO } from '@next-app/src/dto/tariffs/tariff.dto';

const logError = debug('app:services:tariffs:error');

export async function updateTariff(uuid: string, data: UpdateTariffDTO): Promise<Tariff> {
  try {
    if (!uuid) {
      logError('× Отсутствует UUID тарифа');
      throw new Error('Missing required parameter: uuid');
    }

    const {
      name,
      vehicleType,
      description,
      price,
      freeWaitTimeBishkek,
      pricePerMinuteAfterBishkek,
      freeWaitTimeAirport,
      pricePerMinuteAfterAirport,
      serviceLevel,
      tariffAdditionalServices,
    } = data;

    // Используем транзакцию для обновления тарифа и связанных записей
    const result = await prisma.$transaction(async (tx) => {
      // Обновляем тариф
      const updatedTariff = await tx.tariff.update({
        where: {
          uuid: uuid,
        },
        data: {
          name,
          vehicleType,
          description,
          price,
          freeWaitTimeBishkek,
          pricePerMinuteAfterBishkek,
          freeWaitTimeAirport,
          pricePerMinuteAfterAirport,
          serviceLevel,
        },
      });

      // Удаляем существующие записи tariffAdditionalServices
      await tx.tariffOnService.deleteMany({
        where: {
          tariffUuid: uuid,
        },
      });

      // Создаем новые записи в таблице tariff_on_service (если они предоставлены)
      if (tariffAdditionalServices) {
        for (const additionalService of tariffAdditionalServices) {
          await tx.tariffOnService.create({
            data: {
              uuid: uuidv4(),
              tariffUuid: uuid,
              serviceUuid: additionalService.serviceUuid,
              price: additionalService.price,
              isAvailable:
                additionalService.isAvailable !== undefined ? additionalService.isAvailable : true,
            },
          });
        }
      }

      return updatedTariff;
    });

    return result;
  } catch (error) {
    logError('× Ошибка при обновлении тарифа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
