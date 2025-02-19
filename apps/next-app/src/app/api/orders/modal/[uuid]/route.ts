import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';

interface Params {
  uuid: string;
}

//GET‑запрос для получения детальной информации о заказе по UUID
export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;

  if (!uuid) {
    return NextResponse.json({ error: 'Order UUID is required' }, { status: 400 });
  }

  try {
    //Получаем заказ с нужными связями, включая дополнительные услуги
    const order = await prisma.order.findUnique({
      where: { uuid },
      include: {
        createdBy: true,
        tariff: true,
        departurePoint: true,
        arrivalPoint: true,
        assignedDriver: true,
        orderTariffAdditionalServices: {
          include: {
            tariffOnService: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    //Получаем промежуточные точки, если они есть
    const intermediatePoints =
      order.intermediatePoints && order.intermediatePoints.length > 0
        ? await prisma.point.findMany({
            where: {
              uuid: { in: order.intermediatePoints },
            },
          })
        : [];

    const formattedIntermediatePoints = intermediatePoints.map((point) => ({
      uuid: point.uuid,
      address: point.address,
    }));

    //Форматируем дополнительные услуги: берем имя услуги и цену из tariffOnService
    const additionalServices = order.orderTariffAdditionalServices.map((ots) => ({
      uuid: ots.uuid,
      name: ots.tariffOnService.service.name,
      price: ots.tariffOnService.price,
    }));

    const formattedOrder = {
      createdBy: order.createdBy
        ? {
            uuid: order.createdBy.uuid,
            fullName: order.createdBy.fullName,
            phone: order.createdBy.phone,
          }
        : null,
      tariffUuid: order.tariffUuid,
      tariff: order.tariff
        ? {
            uuid: order.tariff.uuid,
            name: order.tariff.name,
            price: order.tariff.price,
          }
        : null,
      departurePointId: order.departurePointId,
      departurePoint: order.departurePoint
        ? {
            uuid: order.departurePoint.uuid,
            address: order.departurePoint.address,
          }
        : null,
      arrivalPointId: order.arrivalPointId,
      arrivalPoint: order.arrivalPoint
        ? {
            uuid: order.arrivalPoint.uuid,
            address: order.arrivalPoint.address,
          }
        : null,
      assignedDriverId: order.assignedDriverId,
      assignedDriver: order.assignedDriver
        ? {
            fullName: order.assignedDriver.fullName,
            phone: order.assignedDriver.phone,
            driverAcceptanceStatus: order.assignedDriver.driverAcceptanceStatus,
          }
        : null,
      status: order.status,
      basePrice: order.basePrice,
      departureTime: order.departureTime,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      intermediatePoints: formattedIntermediatePoints,
      description: order.description,
      flightNumber: order.flightNumber,
      waitingTimeMinutes: order.waitingTimeMinutes,
      additionalServices,
    };

    return NextResponse.json(formattedOrder, { status: 200 });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Unable to fetch order' }, { status: 500 });
  }
}
