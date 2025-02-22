import { NextResponse } from 'next/server'
import debug from 'debug'
import { prisma } from '@shared/prisma/prisma-client'
import { v4 as uuidv4 } from 'uuid'
import { AdditionalService } from '@prisma/client'

// Используем отдельный неймспейс для ошибок
const logError = debug('app:additional-services:error')

// POST: Создание новой услуги
export async function POST(req: Request) {
  try {
    const data: AdditionalService = await req.json()
    const { name } = data

    // Валидация
    if (!name) {
      logError('× Название услуги отсутствует (400)')
      return NextResponse.json(
        { status: 'error', message: 'Название услуги обязательно' },
        { status: 400 },
      )
    }

    const now = new Date()
    const uuid = uuidv4()

    // Формируем объект услуги
    const additionalService = {
      uuid,
      name,
      createdAt: now,
      updatedAt: now,
    }

    // Сохраняем в БД
    const createdAdditionalService = await prisma.additionalService.create({
      data: additionalService,
    })

    // Успешный результат — без логов
    return NextResponse.json(createdAdditionalService)
  } catch (error) {
    // Логируем только при ошибке
    logError('× Ошибка при создании услуги')
    if (error instanceof Error) {
      logError('Error message:', error.message)
      logError('Error stack:', error.stack)
    }
    return NextResponse.json({ error: 'Unable to create additional service' }, { status: 500 })
  }
}

// GET: Получение списка услуг с пагинацией
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const parsedParams = {
      page: parseInt(searchParams.get('page') || '1', 10),
      per_page: parseInt(searchParams.get('per_page') || '10', 10),
      search: searchParams.get('search') || null,
      sort_by: (searchParams.get('sort_by') as 'name' | 'createdAt' | 'updatedAt') || 'createdAt',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
    }

    // Формируем условия для поиска
    const where: { name?: { contains: string; mode: 'insensitive' } } = {}
    if (parsedParams.search) {
      where.name = { contains: parsedParams.search, mode: 'insensitive' }
    }

    // Запросы к БД
    const additionalServices = await prisma.additionalService.findMany({
      skip: (parsedParams.page - 1) * parsedParams.per_page,
      take: parsedParams.per_page,
      where,
      orderBy: {
        [parsedParams.sort_by]: parsedParams.sort_order,
      },
    })

    const total = await prisma.additionalService.count({ where })

    // Успешный результат — без логов
    return NextResponse.json({
      status: 'success',
      message: 'Fetched additional services successfully',
      data: {
        page: parsedParams.page,
        per_page: parsedParams.per_page,
        total,
        additionalServices,
      },
    })
  } catch (error) {
    // Логируем только при ошибке
    logError('× Ошибка при получении списка услуг')
    if (error instanceof Error) {
      logError('Error message:', error.message)
      logError('Error stack:', error.stack)
    }
    return NextResponse.json({ error: 'Unable to fetch additional services' }, { status: 500 })
  }
}
