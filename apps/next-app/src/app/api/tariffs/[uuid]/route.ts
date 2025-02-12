import { NextRequest, NextResponse } from 'next/server';
import debug from 'debug';
import { EditTariffData } from '@shared/prisma/interface/tariff/interface';
import { prisma } from '@shared/prisma/prisma-client';
import { v4 as uuidv4 } from 'uuid';

const log = debug('app:tariffs:uuid');

// Интерфейс для параметров запроса
interface Params {
  uuid: string;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    // Await params to resolve the Promise
    const { uuid } = await params;
    const data = await req.json();
    const updateData: EditTariffData = data;

    if (!uuid) {
      return NextResponse.json({ error: 'Missing required parameter: uuid' }, { status: 400 });
    }

    const {
      name,
      vehicleType,
      description,
      price,
      additionalPointPrice,
      freeWaitTimeBishkek,
      pricePerMinuteAfterBishkek,
      freeWaitTimeAirport,
      pricePerMinuteAfterAirport,
      serviceLevel,
      tariffAdditionalServices,
    } = data;

    // Используем транзакцию для обновления тарифа и связанных записей
    const result = await prisma.$transaction(async (prisma) => {
      // Обновляем тариф
      const updatedTariff = await prisma.tariff.update({
        where: {
          uuid: uuid,
        },
        data: {
          name,
          vehicleType,
          description,
          price,
          additionalPointPrice,
          freeWaitTimeBishkek,
          pricePerMinuteAfterBishkek,
          freeWaitTimeAirport,
          pricePerMinuteAfterAirport,
          serviceLevel,
        },
      });

      log('Updated tariff:', updatedTariff);

      // Удаляем существующие записи tariffAdditionalServices
      await prisma.tariffOnService.deleteMany({
        where: {
          tariffUuid: uuid,
        },
      });

      log('Deleted existing TariffOnService records for tariffUuid:', uuid);

      // Создаем новые записи в таблице tariff_on_service (если они предоставлены)
      if (tariffAdditionalServices) {
        for (const additionalService of tariffAdditionalServices) {
          await prisma.tariffOnService.create({
            data: {
              uuid: uuidv4(),
              tariffUuid: uuid,
              serviceUuid: additionalService.serviceUuid,
              price: additionalService.price,
              isAvailable:
                additionalService.isAvailable !== undefined ? additionalService.isAvailable : true,
            },
          });

          log(
            'TariffOnService created with tariffUuid:',
            uuid,
            'serviceUuid:',
            additionalService.serviceUuid,
            'price:',
            additionalService.price,
            'isAvailable:',
            additionalService.isAvailable,
          );
        }
      }

      return updatedTariff;
    });

    log('Updated tariff:', result);
    return NextResponse.json({
      status: 'success',
      message: 'Tariff updated successfully',
      uuid: result.uuid,
    });
  } catch (error) {
    log('Error updating tariff:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to update tariff' }, { status: 500 });
  }
}
