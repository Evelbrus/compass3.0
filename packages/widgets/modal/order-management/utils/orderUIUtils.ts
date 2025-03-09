// utils/orderUIUtils.ts
export const getEstimatedArrivalTime = (orderData) => {
  if (orderData?.estimatedArrivalTime) {
    return new Date(orderData.estimatedArrivalTime).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  if (orderData?.departureTime && orderData?.estimatedDurationMinutes) {
    const departureTime = new Date(orderData.departureTime);
    const arrivalTime = new Date(
      departureTime.getTime() + orderData.estimatedDurationMinutes * 60000,
    );
    return arrivalTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }
  return 'Не указано';
};

export const getWaitingPrice = (orderData) => {
  if (!orderData || !orderData.waitingTimeMinutes) return 0;
  return orderData.waitingTimeMinutes * 10;
};
