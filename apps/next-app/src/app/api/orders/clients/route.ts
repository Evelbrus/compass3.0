import { NextResponse } from 'next/server'
import debug from 'debug'
import { prisma } from '@shared/prisma/prisma-client'
import { UserRole } from '@prisma/client'

// Логи только для ошибок
const logError = debug('app:api:orders:clients:error')

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const searchParams = url.searchParams

    const page = parseInt(searchParams.get('page') || '1', 10)
    const perPage = parseInt(searchParams.get('per_page') || '10', 10)
    const roles = searchParams.getAll('role') as UserRole[]
    const search = searchParams.get('search')

    const errors: string[] = []

    if (isNaN(page) || page < 1) {
      errors.push('Invalid page parameter')
    }
    if (isNaN(perPage) || perPage < 1 || perPage > 100) {
      errors.push('Invalid per_page parameter (1-100)')
    }
    if (
      roles.length > 0 &&
      !roles.every((role) => Object.values(UserRole).includes(role))
    ) {
      errors.push(`Invalid role. Allowed values: ${Object.values(UserRole).join(', ')}`)
    }

    if (errors.length > 0) {
      logError('× Ошибки валидации', errors)
      return NextResponse.json(
        { status: 'error', message: 'Validation errors', errors },
        { status: 400 }
      )
    }

    const whereClause = {
      ...(roles.length > 0 && { role: { in: roles } }),
      ...(search && {
        fullName: {
          startsWith: search,
          mode: 'insensitive' as const,
        },
      }),
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        select: {
          uuid: true,
          fullName: true,
          phone: true,
          role: true,
          companyProfile: {
            select: {
              companyName: true,
            },
          },
        },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    // Успешный ответ — без логов
    return NextResponse.json({
      status: 'success',
      data: {
        page,
        perPage,
        total,
        users,
      },
    })
  } catch (error) {
    logError('× Ошибка при получении списка клиентов')
    if (error instanceof Error) {
      logError('Error message:', error.message)
      logError('Error stack:', error.stack)
    }
    return NextResponse.json({ error: 'Unable to fetch clients' }, { status: 500 })
  }
}
