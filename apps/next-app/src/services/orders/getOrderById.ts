// app/src/services/orders/getOrderById.ts
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';

const logError = debug('app:services:orders:error');
const log = debug('app:services:orders');

export async function getOrderById(uuid: string): Promise<{ order: any; formattedOrder: any }> {
  try {
    if (!uuid) {
      logError('× UUID заказа отсутствует');
      throw new Error('Order UUID is required');
    }

    // Получаем заказ с нужными связями
    const order = await prisma.order.findUnique({
      where: { uuid },
      include: {
        createdBy: true,
        tariff: {
          include: {
            tariffAdditionalServices: {
              include: { service: true },
            },
          },
        },
        departurePoint: true,
        arrivalPoint: true,
        assignedDriver: {
          include: {
            vehicleDriver: {
              select: {
                vehicle: {
                  select: {
                    brand: true,
                    model: true,
                    color: true,
                    vehicleType: true,
                    serviceLevels: true,
                    plateNumber: true,
                  },
                },
              },
            },
          },
        },
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
      logError(`× Заказ с UUID ${uuid} не найден`);
      throw new Error('Order not found');
    }

    // Получаем промежуточные точки, если они есть
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

    // Форматируем дополнительные услуги
    const additionalServices = order.orderTariffAdditionalServices.map((ots) => ({
      uuid: ots.uuid,
      name: ots.tariffOnService.service.name,
      price: ots.tariffOnService.price,
    }));

    // Получаем информацию о транспортном средстве
    const vehicleInfo = order.assignedDriver?.vehicleDriver?.vehicle
      ? {
          brand: order.assignedDriver.vehicleDriver.vehicle.brand,
          model: order.assignedDriver.vehicleDriver.vehicle.model,
          color: order.assignedDriver.vehicleDriver.vehicle.color,
          vehicleType: order.assignedDriver.vehicleDriver.vehicle.vehicleType,
          serviceLevels: order.assignedDriver.vehicleDriver.vehicle.serviceLevels,
          plateNumber: order.assignedDriver.vehicleDriver.vehicle.plateNumber,
        }
      : null;

    // Форматируем заказ по образцу
    const formattedOrder = {
      uuid: order.uuid,
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
            uuid: order.assignedDriver.uuid,
            fullName: order.assignedDriver.fullName,
            phone: order.assignedDriver.phone,
            vehicle: vehicleInfo,
          }
        : null,
      driverAcceptanceStatus: order.driverAcceptanceStatus,
      status: order.status,
      basePrice: order.basePrice.toString(),
      departureTime: order.departureTime.toISOString(),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      intermediatePoints: formattedIntermediatePoints,
      description: order.description,
      flightNumber: order.flightNumber,
      waitingTimeMinutes: order.waitingTimeMinutes,
      additionalServices,
    };

    log(`✓ Заказ с UUID ${uuid} успешно получен и отформатирован`);
    return { order, formattedOrder };
  } catch (error) {
    logError('× Ошибка при получении заказа');
    if (error instanceof Error) {
      logError('Error message:', error.message);
      logError('Error stack:', error.stack);
    }
    throw error;
  }
}
