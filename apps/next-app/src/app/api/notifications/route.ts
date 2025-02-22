import { NextResponse, NextRequest } from 'next/server'
import debug from 'debug'
import { prisma } from '@shared/prisma/prisma-client'
import { v4 as uuidv4 } from 'uuid'
import { Action } from '@prisma/client'

// Включаем логи только для ошибок
const logError = debug('app:api:notifications:error')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Проверяем, передан ли массив userIds (множественные уведомления)
    if (Array.isArray(body.userIds)) {
      const { userIds, title, message, orderId, action, createdById } = body
      if (!userIds?.length || !title || !message || !orderId || !createdById) {
        logError('× Отсутствуют обязательные поля (bulk notifications)')
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      const notificationsData = userIds.map((userId: string) => ({
        uuid: uuidv4(),
        userId,
        title,
        message,
        orderId,
        action: action ?? Action.info,
        createdById,
      }))
      const result = await prisma.notification.createMany({ data: notificationsData })

      // Успешный результат (без логирования)
      return NextResponse.json(result, { status: 201 })
    } else {
      // Одиночное уведомление
      const { userId, title, message, orderId, action, createdById } = body
      if (!userId || !title || !message || !orderId || !createdById) {
        logError('× Отсутствуют обязательные поля (single notification)')
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
      }

      const notification = await prisma.notification.create({
        data: {
          uuid: uuidv4(),
          userId,
          title,
          message,
          orderId,
          action: action ?? Action.info,
          createdById,
        },
      })

      // Успешный результат (без логирования)
      return NextResponse.json(notification, { status: 201 })
    }
  } catch (error) {
    // Логируем только при реальной ошибке (серверной)
    logError('× Ошибка при создании уведомления')
    if (error instanceof Error) {
      logError('Error message:', error.message)
      logError('Error stack:', error.stack)
    }
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    if (!userId) {
      logError('× Параметр userId не передан')
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
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
