import { NextResponse } from 'next/server'
import { VehicleType, ServiceLevels } from '@prisma/client'
import debug from 'debug'
import { CreateTariffData } from '@shared/prisma/interface/tariff/interface'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@shared/prisma/prisma-client'

// Логи только для ошибок
const logError = debug('app:tariffs:error')

// GET: Получить список тарифов
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const parsedParams = {
      page: parseInt(searchParams.get('page') || '1', 10),
      per_page: parseInt(searchParams.get('per_page') || '20', 10),
      vehicleType: searchParams.get('vehicleType') as VehicleType | null,
      serviceLevel: searchParams.get('serviceLevel') as ServiceLevels | null,
      sort_by: (searchParams.get('sort_by') as 'name' | 'createdAt' | 'updatedAt') || 'createdAt',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
    }

    // Формируем условие выборки
    const where: {
      vehicleType?: VehicleType
      serviceLevel?: ServiceLevels
    } = {}
    if (parsedParams.vehicleType) {
      where.vehicleType = parsedParams.vehicleType
    }
    if (parsedParams.serviceLevel) {
      where.serviceLevel = parsedParams.serviceLevel
    }

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
    })

    const total = await prisma.tariff.count({ where })
    const totalAllTariffs = await prisma.tariff.count()

    // Успешный ответ без логов
    const response = tariffs.map((tariff) => ({
      ...tariff,
      tariffAdditionalServices: tariff.tariffAdditionalServices.map((service) => ({
        ...service,
        name: service.service.name,
        price: service.price,
      })),
    }))

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
    })
  } catch (error) {
    // Логируем только при ошибке
    logError('× Error fetching tariffs')
    if (error instanceof Error) {
      logError('Error message:', error.message)
      logError('Error stack:', error.stack)
    }
    return NextResponse.json({ error: 'Unable to fetch tariffs' }, { status: 500 })
  }
}

// POST: Создать тариф
export async function POST(req: Request) {

    const data: CreateTariffData = await req.json()
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
    } = data

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
      logError('× Missing required fields (400)')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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
      })

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
        })
      }

      return newTariff
    })

    // Успешный ответ без логов
    return NextResponse.json({
      status: 'success',
      message: 'Tariff created successfully',
      uuid: result.uuid,
    })

}
