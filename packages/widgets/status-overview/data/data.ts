import { OrderStatus } from '@prisma/client';

export const statusOverview: {
  status: OrderStatus;
  label: string;
  description: string;
}[] = Object.values(OrderStatus).map((status) => {
  let label = '';
  let description = '';
  switch (status) {
    case OrderStatus.PENDING:
      label = 'В ожидании';
      description = 'Ваш заказ принят и ожидает обработки.';
      break;
    case OrderStatus.PLANNED:
      label = 'Запланированые';
      description =
        'Ваш заказ запланирован на указанное время и дату. Убедитесь, что вы будете готовы к поездке, и водитель прибудет вовремя для выполнения заказа.';
      break;
    case OrderStatus.IN_PROGRESS:
      label = 'В процессе';
      description = 'Ваш заказ выполняется.';
      break;
    case OrderStatus.COMPLETED:
      label = 'Выполненные';
      description =
        'Ваш заказ успешно завершен. Водитель доставил вас до пункта назначения, и все необходимые услуги оказаны. Благодарим за использование CompassTransfer Taksi!';
      break;
    case OrderStatus.CANCELLED:
      label = 'Отмененные';
      description = 'Ваш заказ был отменен.';
      break;
    case OrderStatus.OVERDUE:
      label = 'Просроченые';
      description =
        'Ваш заказ не был выполнен в установленное время. Пожалуйста, свяжитесь с поддержкой CompassTransfer Taksi для уточнения ситуации или повторного назначения водителя.';
      break;
    default:
      label = 'Неизвестный статус';
      description =
        'Описание статуса недоступно. Пожалуйста, обратитесь в службу поддержки CompassTransfer Taksi для получения дополнительной информации.';
  }
  return { status, label, description };
});
