// app/api/client-corp/orders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import debug from 'debug';
import { UserRole } from '@prisma/client';
import {
  authenticateRequest,
  JwtPayload,
} from '@next-app/src/utils/authenticate/authenticateRequest';
import { createClientCorpOrder } from '@next-app/src/services/orders/clientCorpOrderService';
import { getClientCorpOrders } from '@next-app/src/services/orders/getClientCorpOrders';
import {
  CreateClientCorpOrderDTO,
  GetClientCorpOrdersRequestDTO,
} from '@next-app/src/dto/orders/client-corp-order.dto';


const log = debug('app:client-corp/orders');
const logError = debug('app:client-corp/orders:error');

/** POST-запрос: Создание заказа для ClientCorp и отправка уведомлений */
export async function POST(req: NextRequest) {
  try {
    // Аутентификация с проверкой роли ClientCorp
    const token: JwtPayload = await authenticateRequest(req, [UserRole.ClientCorp]);
    const clientUuid = token.uuid;

    let data: CreateClientCorpOrderDTO;
    try {
      data = await req.json();
      log('Received data:', data);
    } catch (error) {
      log('Error parsing JSON:', error);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Валидация обязательных полей
    if (!data.departureTime) {
      log('departureTime is missing');
      return NextResponse.json({ error: 'departureTime is required' }, { status: 400 });
    }

    // Создаем заказ и все связанные с этим действия
    const result = await createClientCorpOrder(clientUuid, data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    logError('Error creating order:', error);
    return NextResponse.json({ error: 'Unable to create order' }, { status: 500 });
  }
}

/** GET-запрос: Получение заказов корпоративного клиента */
export async function GET(req: NextRequest) {
  try {
    const token: JwtPayload = await authenticateRequest(req);
    const userId = token.uuid;

    // Получаем параметры запроса
    const { searchParams } = new URL(req.url);
    const params: GetClientCorpOrdersRequestDTO = {
      page: parseInt(searchParams.get('page') || '1', 10),
      per_page: parseInt(searchParams.get('per_page') || '10', 10),
      status: (searchParams.get('status') as any) || null,
      sort_by: (searchParams.get('sort_by') as any) || 'departureTime',
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || 'asc',
    };

    // Получаем список заказов
    const response = await getClientCorpOrders(userId, params);

    return NextResponse.json(response);
  } catch (error) {
    logError('Error fetching orders for ClientCorp:', error);
    return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }
}
