import { useState, useEffect, useCallback, useRef } from 'react';
import { DriverAcceptanceStatus, OrderStatus } from '@prisma/client';
import { fetchOrderDetails, fetchPointByUuid } from '@features/orders/create/api/orders.api';
import { OrderDetail } from '@widgets/modal/order-management/types/order.types';
import { calculateProgress } from '@widgets/modal/order-management/utils/orderUtils';
import { useUnit } from 'effector-react';
import { $activeNotification } from '@shared/lib/effector/state/state';

export const useOrderData = (orderId: string, isOpen: boolean) => {
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [currentStage, setCurrentStage] = useState<DriverAcceptanceStatus>(
    DriverAcceptanceStatus.PENDING,
  );
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intermediateAddresses, setIntermediateAddresses] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  // Подписываемся на обновления активного уведомления, чтобы реагировать на изменения статуса
  const activeNotification = useUnit($activeNotification);
  const prevNotificationRef = useRef(activeNotification);

  // Получение адреса точки
  const getPointAddress = useCallback(async (pointId: string | { address: string }) => {
    try {
      if (typeof pointId === 'string') {
        const pointData = await fetchPointByUuid(pointId);
        return pointData.address || 'Адрес не указан';
      } else if (typeof pointId === 'object' && pointId !== null && 'address' in pointId) {
        return pointId.address || 'Адрес не указан';
      }
      return 'Некорректный формат адреса';
    } catch (error) {
      console.error(`Ошибка загрузки точки ${pointId}:`, error);
      return 'Адрес не загружен';
    }
  }, []);

  // Расчет прогресса поездки
  useEffect(() => {
    if (!orderData || !currentStage) return;
    setProgress(calculateProgress(currentStage));
  }, [orderData, currentStage]);

  // Проверка изменений в уведомлениях для обновления данных заказа
  useEffect(() => {
    // Если уведомление изменилось и относится к тому же заказу
    if (
      activeNotification &&
      prevNotificationRef.current !== activeNotification &&
      activeNotification.orderId === orderId
    ) {
      console.log('Обнаружено обновление уведомления для текущего заказа:', activeNotification);

      // Обновляем ссылку на предыдущее уведомление
      prevNotificationRef.current = activeNotification;

      // Перезагружаем данные заказа
      if (isOpen) {
        fetchOrderDetails(orderId)
          .then((data) => {
            console.log('Обновлены данные заказа после получения нового уведомления:', data);
            setOrderData(data);
            setOrderStatus(data.status);
            setCurrentStage(data.driverAcceptanceStatus || DriverAcceptanceStatus.PENDING);
          })
          .catch((err) => {
            console.error('Ошибка обновления данных заказа:', err);
          });
      }
    }
  }, [activeNotification, orderId, isOpen]);

  // Загрузка данных заказа
  useEffect(() => {
    if (!isOpen || !orderId) return;

    let mounted = true;

    const loadOrderData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchOrderDetails(orderId);
        console.log('Загружены данные заказа:', data);

        if (!mounted) return;

        setOrderData(data);
        setOrderStatus(data.status);
        setCurrentStage(data.driverAcceptanceStatus || DriverAcceptanceStatus.PENDING);

        if (data.intermediatePoints && data.intermediatePoints.length > 0) {
          const addresses = await Promise.all(
            data.intermediatePoints.map(async (pointId) => getPointAddress(pointId)),
          );
          if (mounted) setIntermediateAddresses(addresses);
        } else if (mounted) {
          setIntermediateAddresses([]);
        }
      } catch (err) {
        console.error('Ошибка загрузки данных заказа:', err);
        if (mounted) setError('Не удалось загрузить данные заказа');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadOrderData();

    return () => {
      mounted = false;
    };
  }, [isOpen, orderId, getPointAddress]);

  return {
    orderData,
    currentStage,
    orderStatus,
    isLoading,
    error,
    intermediateAddresses,
    progress,
    setCurrentStage,
    setOrderStatus,
    setError,
  };
};
