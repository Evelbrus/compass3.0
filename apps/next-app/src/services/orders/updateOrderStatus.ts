import { prisma } from '@shared/prisma/prisma-client';
import { DriverAcceptanceStatus, OrderStatus, UserRole, DriverStatus } from '@prisma/client';
import {
  UpdateOrderStatusDTO,
  UpdateOrderStatusResultDTO,
} from '@next-app/src/dto/orders/order-status.dto';
import * as notificationService from '@next-app/src/services/notifications/notificationService';

export async function updateOrderStatus(
  uuid: string,
  data: UpdateOrderStatusDTO,
): Promise<UpdateOrderStatusResultDTO> {
  try {
    const { driverStatus, orderStatus, userId, clientById, driverById } = data;
    console.log(
      `updateOrderStatus вызвана с orderStatus: ${orderStatus}, driverStatus: ${driverStatus}`,
    );
    if (!userId || !clientById) {
      throw new Error('Отсутствуют обязательные поля: userId, clientById');
    }
    const order = await prisma.order.findUnique({
      where: { uuid },
      include: {
        assignedDriver: true,
        clientBy: true,
      },
    });
    if (!order) {
      throw new Error('Заказ не найден');
    }
    const currentTime = new Date();
    const departureTime = order.departureTime ? new Date(order.departureTime) : null;
    const isOverdue =
      order.status === OrderStatus.OVERDUE || (departureTime && departureTime < currentTime);
    const isSameDriver = driverById === order.assignedDriverId;
    console.log(`Заказ найден. isOverdue: ${isOverdue}, isSameDriver: ${isSameDriver}`);
    const updatedOrder = await prisma.order.update({
      where: { uuid },
      data: {
        ...(orderStatus && { status: orderStatus }),
        ...(driverStatus && { driverAcceptanceStatus: driverStatus }),
        ...(driverById !== undefined && { assignedDriverId: driverById }),
        updatedAt: new Date(),
      },
    });
    console.log(
      `Заказ обновлён. Новый статус: ${updatedOrder.status}, новый статус водителя: ${updatedOrder.driverAcceptanceStatus}`,
    );
    let updatedDriver = null;
    if (driverById) {
      if (driverStatus === DriverAcceptanceStatus.ACCEPTED) {
        console.log(`Выполняется логика для ACCEPTED`);
        const driver = await prisma.user.findUnique({ where: { uuid: driverById } });
        if (!driver || driver.role !== UserRole.Driver) {
          throw new Error('Водитель не найден или не имеет роли Driver');
        }
        if (!isSameDriver) {
          const activeOrders = await prisma.order.count({
            where: {
              assignedDriverId: driverById,
              status: { in: [OrderStatus.IN_PROGRESS, OrderStatus.PLANNED] },
              NOT: { uuid: order.uuid },
            },
          });
          console.log(`ACTIVE ORDERS у водителя ${driverById}: ${activeOrders}`);
          if (activeOrders > 0) {
            throw new Error(`Водитель занят другими активными заказами (${activeOrders})`);
          }
        }
        updatedDriver = await prisma.user.update({
          where: { uuid: driverById },
          data: { driverStatus: DriverStatus.BUSY },
        });
        console.log(`Обновлён статус водителя ${driverById} на BUSY`);
      } else if (
        driverStatus === DriverAcceptanceStatus.COMPLETED ||
        orderStatus === OrderStatus.CANCELLED
      ) {
        console.log(`Выполняется логика для COMPLETED или CANCELLED`);
        const activeOrders = await prisma.order.count({
          where: {
            assignedDriverId: driverById,
            status: { in: [OrderStatus.IN_PROGRESS, OrderStatus.PLANNED] },
            NOT: { uuid: order.uuid },
          },
        });
        console.log(`Проверка активных заказов для водителя ${driverById}: ${activeOrders}`);
        if (activeOrders === 0) {
          updatedDriver = await prisma.user.update({
            where: { uuid: driverById },
            data: { driverStatus: DriverStatus.FREE },
          });
          console.log(`Обновлён статус водителя ${driverById} на FREE`);
        }
      }
    }
    const adminsAndOperators = await prisma.user.findMany({
      where: { role: { in: [UserRole.Operator, UserRole.Admin] } },
    });
    if (isOverdue && orderStatus === OrderStatus.IN_PROGRESS) {
      console.log(`Заказ просрочен и переходит в IN_PROGRESS, уведомляем админов/операторов`);
      await notificationService.admin.notifyAdminsOverdueOrderAccepted(uuid, driverById || '');
    }
    if (driverStatus && driverById) {
      console.log(`Переход в switch по driverStatus: ${driverStatus}`);
      switch (driverStatus) {
        case DriverAcceptanceStatus.TAKEN:
          console.log(`Вызов: notifyDriverOrderNoted`);
          await notificationService.driver.notifyDriverOrderNoted(driverById, uuid, clientById);
          break;
        case DriverAcceptanceStatus.ACCEPTED:
          console.log(`Вызов: notifyDriverOrderInProgress (isCompleted: false) для ACCEPTED`);
          await notificationService.driver.notifyDriverOrderInProgress(
            driverById,
            uuid,
            clientById,
          );
          console.log(`Вызов: notifyClientOrderStatusChanged для ACCEPTED`);
          await notificationService.client.notifyClientOrderStatusChanged(
            updatedOrder.clientById,
            uuid,
            driverById,
          );
          if (!isOverdue) {
            console.log(`Вызов: processBulkNotifications для админов/операторов`);
            await notificationService.processBulkNotifications({
              users: adminsAndOperators,
              orderId: uuid,
              templateKey: 'orderUpdatedByDriverToAdmins',
              clientId: clientById,
              driverById,
            });
          }
          break;
        case DriverAcceptanceStatus.ON_THE_WAY:
        case DriverAcceptanceStatus.ARRIVED:
        case DriverAcceptanceStatus.PICKED_UP:
          console.log(`Вызов: notifyDriverOrderInProgress для ON_THE_WAY/ARRIVED/PICKED_UP`);
          await notificationService.driver.notifyDriverOrderInProgress(
            driverById,
            uuid,
            clientById,
          );
          console.log(`Вызов: notifyClientOrderInProgress для ON_THE_WAY/ARRIVED/PICKED_UP`);
          await notificationService.client.notifyClientOrderInProgress(
            updatedOrder.clientById,
            uuid,
            driverById,
          );
          break;
        case DriverAcceptanceStatus.COMPLETED:
          console.log(`Вызов: notifyDriverOrderInProgress (isCompleted: true) для COMPLETED`);
          await notificationService.driver.notifyDriverOrderInProgress(
            driverById,
            uuid,
            clientById,
            true,
          );
          console.log(`Вызов: notifyClientOrderStatusChanged (isCompleted: true) для COMPLETED`);
          await notificationService.client.notifyClientOrderStatusChanged(
            updatedOrder.clientById,
            uuid,
            driverById,
            true,
          );
          console.log(`Вызов: notifyAdminOrderUpdated (isCompleted: true) для COMPLETED`);
          // Обновление уведомления администратора для данного заказа не должно перезаписывать уведомление водителя.
          // Если userId (инициатор обновления) совпадает с driverById, пропускаем данный вызов.
          if (userId !== driverById) {
            await notificationService.admin.notifyAdminOrderUpdated(userId, uuid, true);
          } else {
            console.log(
              `Пропущено обновление admin для завершённого заказа, т.к. инициатор совпадает с водителем`,
            );
          }
          break;
        case DriverAcceptanceStatus.PENDING:
          if (orderStatus === OrderStatus.CANCELLED) {
            console.log(`Вызов: notifyDriverOrderCancelled для PENDING при CANCELLED`);
            await notificationService.driver.notifyDriverOrderCancelled(
              driverById,
              uuid,
              clientById,
            );
            console.log(`Вызов: notifyClientOrderCancelledByDriver для PENDING при CANCELLED`);
            await notificationService.client.notifyClientOrderCancelledByDriver(
              updatedOrder.clientById,
              uuid,
              driverById,
            );
            console.log(`Вызов: notifyAdminsOrderCancelledByDriver для PENDING при CANCELLED`);
            await notificationService.admin.notifyAdminsOrderCancelledByDriver(
              uuid,
              driverById,
              clientById,
            );
          }
          break;
        default:
          console.log(`Нет обработчика для driverStatus: ${driverStatus}`);
      }
    }
    // Если заказ не завершён (или отменён) обновляем уведомления для клиента и админа,
    // чтобы не перезаписывать финальное уведомление водителя.
    if (orderStatus && orderStatus !== OrderStatus.COMPLETED) {
      if (userId !== updatedOrder.clientById) {
        if (orderStatus === OrderStatus.PENDING && !order.status) {
          console.log(`Вызов: notifyClientOrderCreated для PENDING`);
          await notificationService.client.notifyClientOrderCreated(clientById, uuid);
        }
        console.log(`Вызов: notifyAdminOrderUpdated для админа/оператора`);
        await notificationService.admin.notifyAdminOrderUpdated(userId, uuid);
        console.log(
          `Вызов: notifyClientOrderUpdatedByAdmin для клиента, обновление заказа администратором`,
        );
        await notificationService.client.notifyClientOrderUpdatedByAdmin(
          updatedOrder.clientById,
          uuid,
          userId,
          driverById,
        );
        if (orderStatus === OrderStatus.CANCELLED) {
          console.log(`Вызов: notifyClientOrderDeletedByAdmin для CANCELLED`);
          await notificationService.client.notifyClientOrderDeletedByAdmin(
            updatedOrder.clientById,
            uuid,
            userId,
            driverById,
          );
          if (updatedOrder.assignedDriverId) {
            console.log(`Вызов: notifyDriverOrderDeletedByAdmin для CANCELLED`);
            await notificationService.driver.notifyDriverOrderDeletedByAdmin(
              updatedOrder.assignedDriverId,
              uuid,
              userId,
            );
          }
        }
      } else if (userId === updatedOrder.clientById) {
        console.log(`Вызов: notifyAdminsOrderUpdatedByClient для клиента`);
        await notificationService.admin.notifyAdminsOrderUpdatedByClient(uuid, userId);
        if (orderStatus === OrderStatus.CANCELLED) {
          if (updatedOrder.assignedDriverId) {
            console.log(`Вызов: notifyDriverOrderCancelledByClient для клиента при CANCELLED`);
            await notificationService.driver.notifyDriverOrderCancelledByClient(
              updatedOrder.assignedDriverId,
              uuid,
              userId,
            );
          }
          console.log(`Вызов: notifyAdminsOrderCancelledByClient для клиента при CANCELLED`);
          await notificationService.admin.notifyAdminsOrderCancelledByClient(uuid, userId);
        }
      }
    }
    const verifiedOrder = await prisma.order.findUnique({
      where: { uuid },
      select: { status: true, driverAcceptanceStatus: true },
    });
    if (
      (orderStatus && verifiedOrder?.status !== orderStatus) ||
      (driverStatus && verifiedOrder?.driverAcceptanceStatus !== driverStatus)
    ) {
      throw new Error('Не удалось зафиксировать изменения заказа в базе данных');
    }
    console.log(
      `Финальное состояние заказа: status=${verifiedOrder?.status}, driverAcceptanceStatus=${verifiedOrder?.driverAcceptanceStatus}`,
    );
    const result: UpdateOrderStatusResultDTO = {
      updatedOrder,
      updatedDriver,
      updatedAdminNotifications: [],
    };
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
}
