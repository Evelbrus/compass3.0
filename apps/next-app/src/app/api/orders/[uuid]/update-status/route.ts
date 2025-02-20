import { NextResponse } from 'next/server';
import { prisma } from '@shared/prisma/prisma-client';
import debug from 'debug';
import { DriverAcceptanceStatus, OrderStatus, Action, DriverStatus } from '@prisma/client';

const log = debug('app:orders:update-status');

interface Params {
  uuid: string;
}

export async function PATCH(req: Request, { params }: { params: Promise<Params> }) {
  const { uuid } = await params;
  log(`Updating status for order UUID: ${uuid}`);

  try {
    const {
      driverStatus,
      orderStatus,
      driverId,
      notificationUuid,
      markNotificationAsRead,
      action,
    } = await req.json();

    log(`Received data:`, { driverStatus, orderStatus, driverId, notificationUuid, action });

    if (driverStatus && !Object.values(DriverAcceptanceStatus).includes(driverStatus)) {
      log(`Invalid driverStatus: ${driverStatus}`);
      return NextResponse.json({ error: 'Invalid driver acceptance status' }, { status: 400 });
    }
    if (orderStatus && !Object.values(OrderStatus).includes(orderStatus)) {
      log(`Invalid orderStatus: ${orderStatus}`);
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }
    if (action && !Object.values(Action).includes(action)) {
      log(`Invalid action: ${action}`);
      return NextResponse.json({ error: 'Invalid action value' }, { status: 400 });
    }

    const updatedData = await prisma.$transaction(async (prismaTx) => {
      const order = await prismaTx.order.findUnique({
        where: { uuid },
      });
      if (!order) {
        log(`Order with UUID ${uuid} not found`);
        throw new Error('Order not found');
      }

      let driver = null;
      if (driverId) {
        driver = await prismaTx.user.findUnique({
          where: { uuid: driverId },
        });
        if (!driver) {
          log(`Driver with UUID ${driverId} not found`);
          throw new Error('Driver not found');
        }
      }

      const updatedOrder = await prismaTx.order.update({
        where: { uuid },
        data: {
          ...(orderStatus && { status: orderStatus }),
          ...(driverStatus && { driverAcceptanceStatus: driverStatus }),
          ...(driverId !== undefined && { assignedDriverId: driverId }),
        },
      });

      let updatedDriver = null;
      if (driverId) {
        if (
          driverStatus === DriverAcceptanceStatus.COMPLETED ||
          driverStatus === DriverAcceptanceStatus.TIMEOUT ||
          orderStatus === OrderStatus.COMPLETED ||
          orderStatus === OrderStatus.CANCELLED ||
          orderStatus === OrderStatus.OVERDUE
        ) {
          updatedDriver = await prismaTx.user.update({
            where: { uuid: driverId },
            data: { driverStatus: DriverStatus.FREE },
          });
        } else if (
          driverStatus === DriverAcceptanceStatus.TAKEN ||
          driverStatus === DriverAcceptanceStatus.ACCEPTED
        ) {
          updatedDriver = await prismaTx.user.update({
            where: { uuid: driverId },
            data: { driverStatus: DriverStatus.BUSY },
          });
        }
      }

      let updatedNotification = null;
      if (notificationUuid && markNotificationAsRead) {
        updatedNotification = await prismaTx.notification.update({
          where: { uuid: notificationUuid },
          data: {
            read: true,
            ...(action && { action }),
          },
        });
        log(`Updated notification:`, updatedNotification);
      }

      return { updatedOrder, updatedDriver, updatedNotification };
    });

    log(`Order ${uuid} updated:`, updatedData);
    return NextResponse.json(updatedData, { status: 200 });
  } catch (error) {
    log('Error updating order and driver status:', error);
    return NextResponse.json({ error: 'Unable to update statuses' }, { status: 500 });
  }
}
