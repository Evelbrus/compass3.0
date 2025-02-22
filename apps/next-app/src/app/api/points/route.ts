import { NextResponse } from 'next/server'
import { prisma } from '@shared/prisma/prisma-client'
import { Prisma } from '@prisma/client'
import debug from 'debug'
import { v4 as uuidv4 } from 'uuid'

// Логи только для ошибок
const logError = debug('app:points:error')

// GET: Получение списка точек с фильтрацией, пагинацией и сортировкой
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const page = searchParams.get('page') || '1'
    const per_page = searchParams.get('per_page') || '10'
    const sort_by = searchParams.get('sort_by') as
      | 'address'
      | 'pricePerKm'
      | 'createdAt'
      | 'updatedAt'
      | 'terrainDifficulty'
      | undefined
    const sort_order = searchParams.get('sort_order') as 'asc' | 'desc' | undefined

    const pageNumber = parseInt(page, 10)
    const perPage = parseInt(per_page, 10)

    // Фильтрация по адресу
    const where: Prisma.PointWhereInput = search
      ? { address: { contains: search, mode: 'insensitive' } }
      : {}

    // Валидация и создание сортировки
    const validSortFields = ['address', 'pricePerKm', 'createdAt', 'updatedAt', 'terrainDifficulty']
    const orderBy: Prisma.PointOrderByWithRelationInput[] = []

    if (sort_by && validSortFields.includes(sort_by)) {
      orderBy.push({ [sort_by]: sort_order ?? 'asc' } as Prisma.PointOrderByWithRelationInput)
    } else {
      orderBy.push({ createdAt: 'asc' })
    }

    // Доп. сортировка по UUID для стабильности
    orderBy.push({ uuid: 'asc' })

    const [points, total] = await Promise.all([
      prisma.point.findMany({
        where,
        orderBy: orderBy.length ? orderBy : undefined,
        skip: (pageNumber - 1) * perPage,
        take: perPage,
        select: {
          uuid: true,
          address: true,
          pricePerKm: true,
          terrainDifficulty: true,
          airport: true,
          latitude: true,
          longitude: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.point.count({ where }),
    ])

    // Успешный результат — без логов
    return NextResponse.json({
      status: 'success',
      message: 'Fetched points successfully',
      data: {
        points,
        total,
        page: pageNumber,
        per_page: perPage,
      },
    })
  } catch (error) {
    logError('× Ошибка при получении точек')
    if (error instanceof Error) {
      logError('Error message:', error.message)
      logError('Error stack:', error.stack)
    }
    return NextResponse.json({ message: 'Ошибка при получении точек' }, { status: 500 })
  }
}

// POST: Создание новой точки
export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { address, pricePerKm, terrainDifficulty, latitude, longitude } = data

    // Валидация
    if (
      !address ||
      pricePerKm === undefined ||
      terrainDifficulty === undefined ||
      !latitude ||
      !longitude
    ) {
      logError('× Отсутствуют обязательные поля при создании точки (400)')
      return NextResponse.json(
        {
          status: 'error',
          message: 'Адрес, цена за километр, коэффициент сложности, широта и долгота обязательны',
        },
        { status: 400 },
      )
    }

    // Успешный сценарий — без логов
    const now = new Date()
    const uuid = uuidv4()

    const point = {
      uuid,
      address,
      pricePerKm: Number(pricePerKm),
      terrainDifficulty: Number(terrainDifficulty),
      airport: false,
      latitude: Number(latitude),
      longitude: Number(longitude),
      createdAt: now,
      updatedAt: now,
    }

    const createdPoint = await prisma.point.create({ data: point })

    return NextResponse.json(createdPoint)
  } catch (error) {
    logError('× Ошибка при создании точки')
    if (error instanceof Error) {
      logError('Error message:', error.message)
      logError('Error stack:', error.stack)
    }
    return NextResponse.json({ error: 'Ошибка при создании точки' }, { status: 500 })
  }
}
