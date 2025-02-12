import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import { DriverAcceptanceStatus, OrderStatus } from '@prisma/client';

interface Params {
  uuid?: string;
}

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  const resolvedParams = await params;
  const { uuid } = resolvedParams;
  const { status, orderStatus, isRead } = await request.json();

  if (!uuid) {
    return NextResponse.json({ message: 'Не указан uuid' }, { status: 400 });
  }

  if (
    !status ||
    !Object.values(DriverAcceptanceStatus).includes(status as DriverAcceptanceStatus)
  ) {
    return NextResponse.json(
      { message: 'Недопустимый статус DriverAcceptanceStatus' },
      { status: 400 },
    );
  }

  if (orderStatus && !Object.values(OrderStatus).includes(orderStatus as OrderStatus)) {
    return NextResponse.json({ message: 'Недопустимый статус OrderStatus' }, { status: 400 });
  }

  try {
    const notification = await prisma.driverOrderNotification.findUnique({
      where: { uuid },
      include: { order: true },
    });

    if (!notification) {
      return NextResponse.json({ message: 'Notification Not Found' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      //Если указан orderStatus, обновляем заказ
      if (orderStatus) {
        const orderUpdateData = {
          status: orderStatus as OrderStatus,
          driverAcceptanceStatus: status as DriverAcceptanceStatus,
        };

        try {
          await tx.order.update({
            where: { uuid: notification.orderId },
            data: orderUpdateData,
          });
        } catch (orderUpdateError: unknown) {
          if (orderUpdateError instanceof Error) {
            console.error('Ошибка при обновлении заказа:', orderUpdateError);
          } else {
            console.error('Ошибка при обновлении заказа:', orderUpdateError);
          }
          throw new Error('Ошибка при обновлении заказа');
        }
      }

      //Если статус COMPLETED или CANCELED — удаляем уведомление
      if (
        status === DriverAcceptanceStatus.COMPLETED ||
        status === DriverAcceptanceStatus.CANCELED
      ) {
        console.log(`Попытка удалить уведомление с UUID: ${uuid}`);
        try {
          await tx.driverOrderNotification.delete({ where: { uuid } });
          console.log(`Уведомление ${uuid} успешно удалено`);
          return { message: 'Уведомление успешно удалено' };
        } catch (deleteError: unknown) {
          if (deleteError instanceof Error) {
            console.error(`Ошибка при удалении уведомления ${uuid}:`, deleteError);
          } else {
            console.error(`Ошибка при удалении уведомления ${uuid}:`, deleteError);
          }
          throw new Error('Ошибка при удалении уведомления');
        }
      } else {
        //Иначе сразу возвращаем результат обновления уведомления
        return await tx.driverOrderNotification.update({
          where: { uuid },
          data: {
            status: orderStatus as OrderStatus,
            isRead: isRead !== undefined ? isRead : false,
          },
        });
      }
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Ошибка при обновлении статуса уведомления:', error);
      return NextResponse.json(
        { message: error.message || 'Ошибка при обновлении статуса уведомления' },
        { status: 500 },
      );
    } else {
      console.error('Ошибка при обновлении статуса уведомления:', error);
      return NextResponse.json(
        { message: 'Ошибка при обновлении статуса уведомления' },
        { status: 500 },
      );
    }
  }
}
