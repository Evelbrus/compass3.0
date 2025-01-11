import { NextResponse } from 'next/server';
import { PrismaClient, VehicleType, ServiceLevels } from '@prisma/client';
import debug from 'debug';
import { CreateTariffData } from '@shared/prisma/interface/tariff/interface';
import { v4 as uuidv4 } from 'uuid';

const log = debug('app:tariffs');
const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsedParams = {
    page: parseInt(searchParams.get('page') || '1', 10),
    per_page: parseInt(searchParams.get('per_page') || '10', 10),
    vehicleType: searchParams.get('vehicleType') as VehicleType | null,
    serviceLevel: searchParams.get('serviceLevel') as ServiceLevels | null,
    sort_by: (searchParams.get('sort_by') as 'name' | 'createdAt' | 'updatedAt') || 'createdAt',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
  };

  log('Parsed parameters:', parsedParams);

  try {
    const where: {
      vehicleType?: VehicleType;
      serviceLevel?: ServiceLevels;
    } = {};
    if (parsedParams.vehicleType) {
      where.vehicleType = parsedParams.vehicleType;
    }
    if (parsedParams.serviceLevel) {
      where.serviceLevel = parsedParams.serviceLevel;
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
        price: service.price,
      })),
    }));

    return NextResponse.json({
      status: 'success',
      message: 'Fetched tariff successfully',
      data: {
        page: parsedParams.page,
        per_page: parsedParams.per_page,
        total,
        totalAllTariffs,
        tariffs: response,
      },
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

  //Валидация входных данных с детализированным логированием
  if (!name) log('Missing field: name');
  if (!vehicleType) log('Missing field: vehicleType');
  if (price === undefined) log('Missing field: price');
  if (additionalPointPrice === undefined) log('Missing field: additionalPointPrice');
  if (freeWaitTimeBishkek === undefined) log('Missing field: freeWaitTimeBishkek');
  if (pricePerMinuteAfterBishkek === undefined) log('Missing field: pricePerMinuteAfterBishkek');
  if (freeWaitTimeAirport === undefined) log('Missing field: freeWaitTimeAirport');
  if (pricePerMinuteAfterAirport === undefined) log('Missing field: pricePerMinuteAfterAirport');
  if (!serviceLevel) log('Missing field: serviceLevel');
  if (!tariffAdditionalServices) log('Missing field: tariffAdditionalServices');

  if (
    !name ||
    !vehicleType ||
    price === undefined ||
    additionalPointPrice === undefined ||
    freeWaitTimeBishkek === undefined ||
    pricePerMinuteAfterBishkek === undefined ||
    freeWaitTimeAirport === undefined ||
    pricePerMinuteAfterAirport === undefined ||
    !serviceLevel ||
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

      //Логирование нового тарифа
      log('New tariff created:', newTariff);

      //Создаем записи в таблице tariff_on_service
      for (const additionalService of tariffAdditionalServices) {
        await prisma.tariffOnService.create({
          data: {
            uuid: uuidv4(),
            tariffUuid: newTariff.uuid,
            serviceUuid: additionalService.serviceUuid,
            price: additionalService.price,
            isAvailable:
              additionalService.isAvailable !== undefined ? additionalService.isAvailable : true,
          },
        });

        log(
          'TariffOnService created with tariffUuid:',
          newTariff.uuid,
          'serviceUuid:',
          additionalService.serviceUuid,
          'price:',
          additionalService.price,
          'isAvailable:',
          additionalService.isAvailable,
        );
      }

      return newTariff;
    });

    log('Created new tariff:', result);
    return NextResponse.json({
      status: 'success',
      message: 'Tariff created successfully',
      uuid: result.uuid,
    });
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
