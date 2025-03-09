// app/src/services/additional-services/updateAdditionalService.ts
import { AdditionalService } from '@prisma/client';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { UpdateAdditionalServiceDTO } from '@next-app/src/dto/additional-services/additional-service.dto';

const logError = debug('app:services:additional-service:error');

export async function updateAdditionalService(
  uuid: string,
  data: UpdateAdditionalServiceDTO,
): Promise<AdditionalService> {
  try {
    const { name } = data;

    if (!name) {
      logError('× Название услуги отсутствует');
      throw new Error('Название услуги обязательно');
    }

    return prisma.additionalService.update({
      where: { uuid },
      data: {
        name,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    logError('× Ошибка при обновлении услуги');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
