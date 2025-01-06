import { NextResponse } from 'next/server';
import { PrismaClient, ClientType, VehicleType, RateType } from '@prisma/client';
import debug from 'debug';
import { CreateTariffData } from '@shared/prisma/interface/tariff/interface';
import { v4 as uuidv4 } from 'uuid';

const log = debug('app:tariffs');
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedParams = {
    page: parseInt(searchParams.get('page') || '1', 10),
    per_page: parseInt(searchParams.get('per_page') || '10', 10),
    clientType: searchParams.get('clientType') as ClientType | null,
    vehicleType: searchParams.get('vehicleType') as VehicleType | null,
    rateType: searchParams.get('rateType') as RateType | null,
    sort_by: (searchParams.get('sort_by') as 'name' | 'createdAt' | 'updatedAt') || 'createdAt',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
  };

  log('Parsed parameters:', parsedParams);

  try {
    //Создаем объект "where" для условий фильтрации
    const where: {
      clientType?: ClientType;
      vehicleTypes?: { has: VehicleType } | undefined;
      rateType?: RateType;
    } = {};
    if (parsedParams.clientType) {
      where.clientType = parsedParams.clientType;
    }
    if (parsedParams.vehicleType) {
      where.vehicleTypes = { has: parsedParams.vehicleType };
    }
    if (parsedParams.rateType) {
      where.rateType = parsedParams.rateType;
    }

    //Выполняем запрос к базе данных для получения списка тарифов
    const tariffs = await prisma.tariff.findMany({
      skip: (parsedParams.page - 1) * parsedParams.per_page,
      take: parsedParams.per_page,
      where,
      orderBy: {
        [parsedParams.sort_by]: parsedParams.sort_order,
      },
      include: {
        tariffAdditionalServices: {
          include: {
            service: true,
          },
        },
        tariffOnServiceLevels: {
          include: {
            service: true,
          },
        },
      },
    });

    const total = await prisma.tariff.count({ where });
    const totalAllTariffs = await prisma.tariff.count();

    log('Fetched tariffs:', tariffs);

    //Формируем ответ с данными о тарифах, опциях тарифа и уровнях обслуживания тарифа
    const response = tariffs.map((tariff) => ({
      ...tariff,
      tariffAdditionalServices: tariff.tariffAdditionalServices.map((service) => ({
        ...service,
        name: service.service.name,
        price: service.service.price,
      })),
    }));

    return NextResponse.json({
      page: parsedParams.page,
      per_page: parsedParams.per_page,
      total,
      totalAllTariffs,
      tariffs: response,
    });
  } catch (error) {
    log('Error fetching tariffs:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch tariffs' }, { status: 500 });
  } finally {
    //Отключаемся от базы данных
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}

export async function POST(req: Request) {
  const data: CreateTariffData = await req.json();
  const {
    name,
    clientType,
    vehicleTypes,
    description,
    rateType,
    additionalPointPrice,
    freeWaitTimeBishkek,
    pricePerMinuteAfterBishkek,
    freeWaitTimeAirport,
    pricePerMinuteAfterAirport,
    tariffOnServiceLevels,
    tariffAdditionalServices,
  } = data;

  //Валидация входных данных
  if (
    !name ||
    !clientType ||
    !vehicleTypes ||
    !rateType ||
    !additionalPointPrice ||
    !freeWaitTimeBishkek ||
    !pricePerMinuteAfterBishkek ||
    !freeWaitTimeAirport ||
    !pricePerMinuteAfterAirport ||
    !tariffOnServiceLevels ||
    !tariffAdditionalServices
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    //Используем транзакцию для создания тарифа и связанных записей
    const result = await prisma.$transaction(async (prisma) => {
      //Создаем новый тариф
      const newTariff = await prisma.tariff.create({
        data: {
          uuid: uuidv4(),
          name,
          clientType,
          vehicleTypes,
          description,
          rateType,
          additionalPointPrice,
          freeWaitTimeBishkek,
          pricePerMinuteAfterBishkek,
          freeWaitTimeAirport,
          pricePerMinuteAfterAirport,
        },
      });

      //Логирование нового тарифа
      log('New tariff created:', newTariff);

      //Создаем записи в таблице tariff_on_service_levels
      for (const serviceTariff of tariffOnServiceLevels) {
        await prisma.tariffOnServiceLevels.create({
          data: {
            uuid: uuidv4(),
            tariffUuid: newTariff.uuid,
            serviceUuid: serviceTariff.serviceUuid,
          },
        });

        log(
          'TariffOnServiceLevels created with tariffUuid:',
          newTariff.uuid,
          'and serviceUuid:',
          serviceTariff.serviceUuid,
        );
      }

      //Создаем записи в таблице tariff_on_service
      for (const additionalService of tariffAdditionalServices) {
        await prisma.tariffOnService.create({
          data: {
            uuid: uuidv4(),
            tariffUuid: newTariff.uuid,
            serviceUuid: additionalService.serviceUuid,
          },
        });

        log(
          'TariffOnService created with tariffUuid:',
          newTariff.uuid,
          'and serviceUuid:',
          additionalService.serviceUuid,
        );
      }

      return newTariff;
    });

    log('Created new tariff:', result);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    log('Error creating tariff:', error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to create tariff' }, { status: 500 });
  } finally {
    //Отключаемся от базы данных
    await prisma.$disconnect();
    log('Disconnected from database');
  }
}
