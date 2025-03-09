// app/src/services/additional-services/getAdditionalServiceById.ts
import { AdditionalService } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const logError = debug('app:services:additional-service:error');

export async function getAdditionalServiceById(uuid: string): Promise<AdditionalService> {
  try {
    const service = await prisma.additionalService.findUnique({
      where: { uuid },
    });

    if (!service) {
      logError(`× Услуга с UUID ${uuid} не найдена`);
      throw new Error('Услуга не найдена');
    }

    return service;
  } catch (error) {
    logError('× Ошибка при получении услуги');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
