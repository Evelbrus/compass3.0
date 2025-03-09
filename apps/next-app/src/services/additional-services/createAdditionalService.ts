// app/src/services/additional-services/createAdditionalService.ts
import { AdditionalService } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';
import debug from 'debug';
import { CreateAdditionalServiceDTO } from '@next-app/src/dto/additional-services/additional-service.dto';

const logError = debug('app:services:additional-service:error');

export async function createAdditionalService(
  data: CreateAdditionalServiceDTO,
): Promise<AdditionalService> {
  try {
    const { name } = data;

    if (!name) {
      logError('× Название услуги отсутствует');
      throw new Error('Название услуги обязательно');
    }

    const now = new Date();
    const uuid = uuidv4();

    // Формируем объект услуги
    const additionalService = {
      uuid,
      name,
      createdAt: now,
      updatedAt: now,
    };

    // Сохраняем в БД
    return prisma.additionalService.create({
      data: additionalService,
    });
  } catch (error) {
    logError('× Ошибка при создании услуги');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
