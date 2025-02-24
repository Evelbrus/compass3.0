export const fetchOrderDetails = async (orderUuid: string) => {
  const response = await fetch(`/api/orders/modal/${orderUuid}`);
  if (!response.ok) {
    throw new Error(`Ошибка получения данных заказа: ${response.statusText}`);
  }
  return response.json();
};