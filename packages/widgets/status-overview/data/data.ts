import { OrderStatus, STATUSES } from '@shared/lib/effector/order/order-status-store/statusStore';

export const statusOverview: {
  status: OrderStatus;
  label: string;
  description: string;
}[] = STATUSES.map((status) => {
  let label = '';
  let description = '';
  switch (status) {
    case 'InTransit':
      label = 'Текущие';
      description =
        'Ваш заказ успешно передан водителю и находится в пути к месту назначения. Вы можете отслеживать маршрут в реальном времени через приложение.';
      break;
    case 'Processing':
      label = 'В обработке';
      description =
        'Ваш заказ принят системой CompassTransfer Taksi и назначен ближайшему доступному водителю. Водитель уже движется к вам или скоро начнет движение.';
      break;
    case 'Completed':
      label = 'Выполненные';
      description =
        'Ваш заказ успешно завершен. Водитель доставил вас до пункта назначения, и все необходимые услуги оказаны. Благодарим за использование CompassTransfer Taksi!';
      break;
    case 'Scheduled':
      label = 'Запланированые';
      description =
        'Ваш заказ запланирован на указанное время и дату. Убедитесь, что вы будете готовы к поездке, и водитель прибудет вовремя для выполнения заказа.';
      break;
    case 'Overdue':
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
