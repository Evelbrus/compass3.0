// app/api/drivers/orders/[uuid]/update-driver-status/route.ts
import { NextResponse } from 'next/server';
import debug from 'debug';
import { updateOrderStatus } from '@next-app/src/services/orders/updateOrderStatus';
import { UpdateOrderStatusDTO } from '@next-app/src/dto/orders/order-status.dto';
import { Params } from '@next-app/src/interface/interface';

const logError = debug('app:api:orders:update-driver-status:error');

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;

  try {
    let data: UpdateOrderStatusDTO;
    try {
      data = await req.json();
    } catch (error) {
      return NextResponse.json({ status: 'error', message: 'Invalid JSON' }, { status: 400 });
    }

    try {
      const result = await updateOrderStatus(uuid, data);
      return NextResponse.json(result, { status: 200 });
    } catch (serviceError) {
      if (serviceError instanceof Error) {
        if (serviceError.message.startsWith('Отсутствуют обязательные поля')) {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
        if (serviceError.message === 'Заказ не найден') {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 404 },
          );
        }
        if (
          [
            'Водитель не найден или не имеет роли Driver',
            'Водитель занят другими активными заказами',
            'Не удалось зафиксировать изменения заказа в базе данных',
          ].some((msg) => serviceError.message.includes(msg))
        ) {
          return NextResponse.json(
            { status: 'error', message: serviceError.message },
            { status: 400 },
          );
        }
      }
      throw serviceError;
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: 'error', message: errorMessage }, { status: 500 });
  }
}
