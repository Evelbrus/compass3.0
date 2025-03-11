import { NextResponse, NextRequest } from 'next/server'
import debug from 'debug'
import { prisma } from '@shared/prisma/prisma-client'

// Включаем логи только для ошибок
const logError = debug('app:api:notifications:error')

export async function GET(request: NextRequest) {
  try {
    const createdById = request.nextUrl.searchParams.get('userId')
    if (!createdById) {
      logError('× Параметр userId не передан')
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 })
    }

    const notifications = await prisma.notification.findMany({
      where: { createdById },
      orderBy: { createdAt: 'desc' },
    })

    // Успешный результат (без логирования)
    return NextResponse.json(notifications)
  } catch (error) {
    // Логируем только при реальной ошибке (серверной)
    logError('× Ошибка при получении уведомлений')
    if (error instanceof Error) {
      logError('Error message:', error.message)
      logError('Error stack:', error.stack)
    }
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
