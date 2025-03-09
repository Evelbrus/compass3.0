// app/src/services/tariffs/createTariff.ts
import { Tariff } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';
import debug from 'debug';
import { CreateTariffDTO } from '@next-app/src/dto/tariffs/tariff.dto';

const logError = debug('app:services:tariffs:error');

export async function createTariff(data: CreateTariffDTO): Promise<Tariff> {
  try {
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

    // Проверка обязательных полей
    if (
      !name ||
      !vehicleType ||
      price === undefined ||
      freeWaitTimeBishkek === undefined ||
      pricePerMinuteAfterBishkek === undefined ||
      freeWaitTimeAirport === undefined ||
      pricePerMinuteAfterAirport === undefined ||
      !serviceLevel ||
      !tariffAdditionalServices
    ) {
      logError('× Отсутствуют обязательные поля');
      throw new Error('Missing required fields');
    }

    // Транзакция
    const result = await prisma.$transaction(async (tx) => {
      // Создаем тариф
      const newTariff = await tx.tariff.create({
        data: {
          uuid: uuidv4(),
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

      // Создаем тариф + сервисы
      for (const additionalService of tariffAdditionalServices) {
        await tx.tariffOnService.create({
          data: {
            uuid: uuidv4(),
            tariffUuid: newTariff.uuid,
            serviceUuid: additionalService.serviceUuid,
            price: additionalService.price,
            isAvailable:
              additionalService.isAvailable !== undefined ? additionalService.isAvailable : true,
          },
        });
      }

      return newTariff;
    });

    return result;
  } catch (error) {
    logError('× Ошибка при создании тарифа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
