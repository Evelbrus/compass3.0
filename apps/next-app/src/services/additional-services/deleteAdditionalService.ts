// app/src/services/additional-services/deleteAdditionalService.ts
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const logError = debug('app:services:additional-service:error');

export async function deleteAdditionalService(uuid: string): Promise<void> {
  try {
    // Проверяем, существует ли услуга
    const existingService = await prisma.additionalService.findUnique({
      where: { uuid },
    });

    if (!existingService) {
      logError(`× Услуга с UUID ${uuid} не найдена`);
      throw new Error('Услуга не найдена');
    }

    await prisma.additionalService.delete({
      where: { uuid },
    });
  } catch (error) {
    logError('× Ошибка при удалении услуги');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
