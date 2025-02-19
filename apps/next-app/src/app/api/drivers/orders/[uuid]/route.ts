import { NextResponse } from 'next/server';
import debug from 'debug';
import { prisma } from '@shared/prisma/prisma-client';

const log = debug('app:orders/[uuid]');

interface Params {
  uuid: string;
}

export async function GET(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;
  log(`Fetching order with UUID: ${uuid}`);

  try {
    const order = await prisma.order.findUnique({
      where: { uuid },
      include: {
        createdBy: true,
        tariff: true,
        departurePoint: true,
        arrivalPoint: true,
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
      log(`Order with UUID ${uuid} not found`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const response = {
      ...order,
      createdBy: {
        uuid: order.createdBy.uuid,
        fullName: order.createdBy.fullName,
        email: order.createdBy.email,
        phone: order.createdBy.phone,
      },
      tariff: {
        uuid: order.tariff.uuid,
        name: order.tariff.name,
        vehicleTypes: order.tariff.vehicleType,
      },
      departurePoint: {
        uuid: order.departurePoint.uuid,
        address: order.departurePoint.address,
        pricePerKm: order.departurePoint.pricePerKm,
        terrainDifficulty: order.departurePoint.terrainDifficulty,
        latitude: order.departurePoint.latitude,
        longitude: order.departurePoint.longitude,
      },
      arrivalPoint: {
        uuid: order.arrivalPoint.uuid,
        address: order.arrivalPoint.address,
        pricePerKm: order.arrivalPoint.pricePerKm,
        terrainDifficulty: order.arrivalPoint.terrainDifficulty,
        latitude: order.arrivalPoint.latitude,
        longitude: order.arrivalPoint.longitude,
      },
      orderTariffAdditionalServices: order.orderTariffAdditionalServices.map((ots) => ({
        uuid: ots.uuid,
        tariffOnServiceUuid: ots.tariffOnServiceUuid,
        createdAt: ots.createdAt,
        updatedAt: ots.updatedAt,
        tariffOnService: {
          uuid: ots.tariffOnService.uuid,
          price: ots.tariffOnService.price,
          isAvailable: ots.tariffOnService.isAvailable,
          serviceUuid: ots.tariffOnService.serviceUuid,
          createdAt: ots.tariffOnService.createdAt,
          updatedAt: ots.tariffOnService.updatedAt,
          name: ots.tariffOnService.service.name,
        },
      })),
    };

    log(`Successfully fetched order with UUID: ${uuid}`);
    return NextResponse.json(response);
  } catch (error) {
    log(`Error fetching order with UUID ${uuid}:`, error);
    if (error instanceof Error) {
      log('Error message:', error.message);
      log('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Unable to fetch order' }, { status: 500 });
  }
}
