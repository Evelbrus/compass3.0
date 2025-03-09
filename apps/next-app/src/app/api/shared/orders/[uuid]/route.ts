// app/api/admin/orders/[uuid]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';
import { getOrderById } from '@next-app/src/services/orders/getOrderById';
import { Params } from '@next-app/src/interface/interface';
import { prisma } from '@shared/prisma/prisma-client';
import { authenticateRequest } from '@next-app/src/utils/authenticate/authenticateRequest';

const logError = debug('app:api:orders-shared:error');
const log = debug('app:orders-shared');

// Роли, которые могут управлять заказами
const allowedRoles = [UserRole.Admin, UserRole.Operator, UserRole.Driver, UserRole.ClientCorp];

// GET: Получение заказа по UUID
export async function GET(req: NextRequest, { params }: { params: Params }) {
  try {
    await authenticateRequest(req, allowedRoles);

    const { uuid } = await params;
    log(`Запрос на получение заказа с UUID: ${uuid}`);

    if (!uuid) {
      log('Order UUID is missing');
      return NextResponse.json({ error: 'Order UUID is required' }, { status: 400 });
    }

    try {
      // Получаем данные заказа
      const { formattedOrder } = await getOrderById(uuid);

      // Получаем общую статистику для админ-панели
      const totalAllOrders = await prisma.order.count();

      // Получаем статистику по статусам
      const statusesCount = await prisma.order.groupBy({
        by: ['status'],
        _count: {
          status: true,
        },
      });

      // Формируем ответ
      const response = {
        uuid: formattedOrder.uuid,
        createdBy: formattedOrder.createdBy,
        tariffUuid: formattedOrder.tariffUuid,
        tariff: formattedOrder.tariff,
        departurePointId: formattedOrder.departurePointId,
        departurePoint: formattedOrder.departurePoint,
        arrivalPointId: formattedOrder.arrivalPointId,
        arrivalPoint: formattedOrder.arrivalPoint,
        assignedDriverId: formattedOrder.assignedDriverId,
        assignedDriver: formattedOrder.assignedDriver,
        driverAcceptanceStatus: formattedOrder.driverAcceptanceStatus,
        status: formattedOrder.status,
        basePrice: formattedOrder.basePrice,
        departureTime: formattedOrder.departureTime,
        createdAt: formattedOrder.createdAt,
        updatedAt: formattedOrder.updatedAt,
        intermediatePoints: formattedOrder.intermediatePoints,
        description: formattedOrder.description,
        flightNumber: formattedOrder.flightNumber,
        waitingTimeMinutes: formattedOrder.waitingTimeMinutes,
        additionalServices: formattedOrder.additionalServices,
        // Добавляем статистику для админ-панели
        _meta: {
          totalAllOrders,
          statusesCount,
        },
      };

      log(`✓ Заказ с UUID ${uuid} успешно получен`);
      return NextResponse.json(response);
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message === 'Order UUID is required') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
        if (serviceError.message === 'Order not found') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 404 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error) {
    logError('× Ошибка при получении заказа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 'error', message: 'Unable to fetch order' },
      { status: 500 },
    );
  }
}
