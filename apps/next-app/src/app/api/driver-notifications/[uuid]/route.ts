import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import { DriverAcceptanceStatus, OrderStatus } from '@prisma/client';

interface Params {
  uuid?: string;
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { uuid } = params;
  const { status, orderStatus, isRead } = await request.json();

  if (!uuid || typeof uuid !== 'string') {
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

  //orderStatus теперь не обязательный. Если его нет - то заказ не меняется.
  if (orderStatus && !Object.values(OrderStatus).includes(orderStatus as OrderStatus)) {
    return NextResponse.json({ message: 'Недопустимый статус OrderStatus' }, { status: 400 });
  }

  try {
    const notification = await prisma.driverOrderNotification.findUnique({
      where: { uuid: uuid },
      include: { order: true },
    });

    if (!notification) {
      return NextResponse.json({ message: 'Notification Not Found' }, { status: 404 });
    }

    //Используем транзакцию
    const result = await prisma.$transaction(async (tx) => {
      //Обновляем заказ
      //Проверяем, нужно ли обновлять статус заказа
      if (orderStatus) {
        const orderUpdateData = {
          driverAcceptanceStatus: status as DriverAcceptanceStatus,
          status: orderStatus as OrderStatus,
        };

        try {
          await tx.order.update({
            where: { uuid: notification.orderId },
            data: orderUpdateData,
          });
        } catch (orderUpdateError) {
          console.error('Ошибка при обновлении заказа:', orderUpdateError);
          throw new Error('Ошибка при обновлении заказа'); //Важно пробрасывать ошибку, чтобы отменить транзакцию
        }
      }

      //Обновляем статус уведомления ИЛИ удаляем его, если COMPLETED ИЛИ CANCELED
      if (
        status === DriverAcceptanceStatus.COMPLETED ||
        status === DriverAcceptanceStatus.CANCELED
      ) {
        console.log(`Попытка удалить уведомление с UUID: ${uuid}`);
        try {
          await tx.driverOrderNotification.delete({
            where: { uuid: uuid },
          });
          console.log(`Уведомление ${uuid} успешно удалено`);
          return { message: 'Уведомление успешно удалено' };
        } catch (deleteError) {
          console.error(`Ошибка при удалении уведомления ${uuid}:`, deleteError);
          throw new Error('Ошибка при удалении уведомления'); //Важно пробрасывать ошибку
        }
      } else {
        //Обновляем isRead и status
        const updatedNotification = await tx.driverOrderNotification.update({
          where: { uuid: uuid },
          data: {
            status: status as DriverAcceptanceStatus,
            isRead: isRead !== undefined ? isRead : false, //Явно устанавливаем false, если не передано
          },
        });

        return updatedNotification;
      }
    });

    return NextResponse.json(result);
  } catch (error: any) {
    //Correctly type the error
    console.error('Ошибка при обновлении статуса уведомления:', error);
    return NextResponse.json(
      { message: error.message || 'Ошибка при обновлении статуса уведомления' },
      { status: 500 },
    );
  }
}
