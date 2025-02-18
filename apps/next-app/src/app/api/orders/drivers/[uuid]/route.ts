import { NextResponse } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';
import { OrderStatus, DriverAcceptanceStatus } from '@prisma/client';

const log = debug('app:orders');

interface Params {
  uuid: string;
}

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;
  log(`PATCH update for order with uuid: ${uuid}`);

  if (!uuid) {
    log('Order uuid missing');
    return NextResponse.json({ error: 'Order uuid is required' }, { status: 400 });
  }

  let body: { driverProgressStatus?: string };
  try {
    body = await req.json();
    log('Received body:', body);
  } catch (error) {
    log('Error parsing JSON:', error);
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { driverProgressStatus } = body;
  if (!driverProgressStatus) {
    log('driverProgressStatus missing');
    return NextResponse.json({ error: 'driverProgressStatus is required' }, { status: 400 });
  }

  //Разрешённые значения
  const allowedStatuses = new Set(['ON_THE_WAY', 'ARRIVED', 'PICKED_UP', 'COMPLETED', 'CANCELED']);
  if (!allowedStatuses.has(driverProgressStatus)) {
    log('Unsupported driverProgressStatus value:', driverProgressStatus);
    return NextResponse.json({ error: 'Unsupported driverProgressStatus value' }, { status: 400 });
  }

  //Определяем, что именно обновлять:
  //По умолчанию обновляем статус пользователя на переданное значение.
  //Если значение требует обновления заказа, то orderStatusToUpdate будет задан.
  let orderStatusToUpdate: OrderStatus | null = null;
  let userStatusToUpdate: DriverAcceptanceStatus = driverProgressStatus as DriverAcceptanceStatus;

  switch (driverProgressStatus) {
    case 'ON_THE_WAY':
      orderStatusToUpdate = OrderStatus.IN_PROGRESS;
      break;
    case 'COMPLETED':
      orderStatusToUpdate = OrderStatus.COMPLETED;
      break;
    case 'CANCELED':
      orderStatusToUpdate = OrderStatus.CANCELLED; //в Order используется CANCELLED (с двумя L)
      break;
    case 'ARRIVED':
    case 'PICKED_UP':
      //Обновляем только статус пользователя
      break;
    default:
      break;
  }

  try {
    const result = await prisma.$transaction(async (prismaTx) => {
      //Ищем заказ, чтобы проверить наличие назначенного водителя
      const order = await prismaTx.order.findUnique({ where: { uuid } });
      if (!order) {
        throw new Error('Order not found');
      }

      let updatedOrder = order;
      //Если нужно обновить заказ – обновляем его статус
      if (orderStatusToUpdate) {
        updatedOrder = await prismaTx.order.update({
          where: { uuid },
          data: { status: orderStatusToUpdate },
        });
      }

      //Если у заказа есть назначенный водитель – обновляем у него статус принятия
      if (updatedOrder.assignedDriverId) {
        await prismaTx.user.update({
          where: { uuid: updatedOrder.assignedDriverId },
          data: { driverAcceptanceStatus: userStatusToUpdate },
        });
      } else {
        log('No assigned driver for this order, user status not updated.');
      }

      return updatedOrder;
    });

    log('Transaction successful, updated order:', result);
    return NextResponse.json(
      {
        message: `Status update successful: ${driverProgressStatus}`,
        order: result,
      },
      { status: 200 },
    );
  } catch (error) {
    log('Error updating order and/or driver status:', error);
    return NextResponse.json(
      { error: 'Unable to update order and/or driver status' },
      { status: 500 },
    );
  }
}
