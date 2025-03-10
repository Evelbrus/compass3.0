import { useCallback } from 'react';
import { showToast } from '@shared/components/toast/ToastManager';
import { useRouter } from 'next/navigation';
import { UserRole, OrderStatus, TariffOnService, Point, Tariff } from '@prisma/client';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { Driver, OrderData } from '@features/orders/create/types/types';
import { Decimal } from 'decimal.js';

// Тип для данных заказа для роли ClientCorp (только создание)
interface ClientCorpOrderPayload {
  tariffUuid: string | null;
  departureTime: Date;
  departurePoint: string | null;
  arrivalPoint: string | null;
  intermediatePoints: string[];
  basePrice: number;
  selectedServices: string[];
  description: string;
  flightNumber: string;
  waitingTimeMinutes: number;
  status: OrderStatus;
}

// Тип для данных заказа для ролей Admin и Operator (создание и редактирование)
interface AdminOrderPayload {
  clientBy: string | undefined;
  tariffUuid: string | null;
  departureTime: Date;
  departurePoint: string | null;
  arrivalPoint: string | null;
  intermediatePoints: string[];
  basePrice: number;
  selectedServices: string[];
  assignedDriverId: string | null;
  description: string;
  flightNumber: string;
  waitingTimeMinutes: number;
  fullName?: string;
  phone?: string;
  status: OrderStatus;
}

// Хук для отправки заказа
export const useOrderSubmit = (
  role: UserRole,
  mode: 'create' | 'edit',
  orderData?: OrderData | null,
  selectedTariff?: (Tariff & { tariffAdditionalServices: TariffOnService[] }) | null,
  departurePoint?: Pick<Point, 'uuid'> | null,
  arrivalPoint?: Pick<Point, 'uuid'> | null,
  selectedServices?: TariffOnService[],
  totalPrice?: Decimal,
  waitTime?: number,
  selectedDriverInfo?: Driver | null,
) => {
  const router = useRouter();

  return useCallback(
    async (data: FormOrderValues) => {
      // Проверка обязательных полей
      const errorMessages: string[] = [];

      // Проверка на выбор клиента или создание нового
      if (!orderData?.clientBy?.uuid && !data.clientBy?.uuid && !(data.fullName && data.phone)) {
        errorMessages.push('Выберите клиента или укажите данные для создания нового');
      }

      // Проверка точки отправления
      if (!departurePoint?.uuid && !data.departurePoint?.uuid) {
        errorMessages.push('точку отправления');
      }

      // Проверка точки прибытия
      if (!arrivalPoint?.uuid && !data.arrivalPoint?.uuid) {
        errorMessages.push('точку прибытия');
      }

      // Проверка тарифа
      if (!selectedTariff?.uuid && !orderData?.tariff?.uuid) {
        errorMessages.push('тариф');
      }

      // Если есть ошибки, показываем сообщение и прерываем отправку
      if (errorMessages.length > 0) {
        showToast.error(`Необходимо указать: ${errorMessages.join(', ')}`);
        return;
      }

      let payload: ClientCorpOrderPayload | AdminOrderPayload;
      let apiUrl: string;
      let method: 'POST' | 'PUT';

      // Клиент (ClientCorp) может только создавать заказы
      if (role === UserRole.ClientCorp) {
        if (mode === 'edit') {
          showToast.error('Ошибка: клиенты не могут редактировать заказы');
          return;
        }

        payload = {
          tariffUuid: selectedTariff?.uuid || orderData?.tariff?.uuid || null,
          departureTime: data.departureTime || new Date(),
          departurePoint: departurePoint?.uuid || data.departurePoint?.uuid || null,
          arrivalPoint: arrivalPoint?.uuid || data.arrivalPoint?.uuid || null,
          intermediatePoints:
            data.intermediatePoints
              ?.map((point) => point?.uuid)
              .filter((uuid): uuid is string => Boolean(uuid)) || [],
          basePrice: data.basePrice ? Number(data.basePrice) : totalPrice?.toNumber() || 0,
          selectedServices: (selectedServices || orderData?.selectedServices || []).map(
            (service) => service.uuid,
          ), // Передаём только UUID
          description: data.description.description || '',
          flightNumber: data.flightNumber.flightNumber || '',
          waitingTimeMinutes: waitTime || 0,
          status: data.status as OrderStatus,
        };
        apiUrl = '/api/client-corp/orders';
        method = 'POST';
      }
      // Admin и Operator могут создавать и редактировать заказы
      else {
        if (mode === 'edit' && !orderData?.uuid) {
          showToast.error('Ошибка: отсутствует UUID заказа для редактирования');
          return;
        }

        const isNewClientMode = !!data.fullName && !!data.phone;
        payload = {
          clientBy: isNewClientMode
            ? undefined
            : orderData?.clientBy?.uuid || data.clientBy?.uuid,
          tariffUuid: selectedTariff?.uuid || orderData?.tariff?.uuid || null,
          departureTime: data.departureTime || new Date(),
          departurePoint: departurePoint?.uuid || data.departurePoint?.uuid || null,
          arrivalPoint: arrivalPoint?.uuid || data.arrivalPoint?.uuid || null,
          intermediatePoints:
            data.intermediatePoints
              ?.map((point) => point?.uuid)
              .filter((uuid): uuid is string => Boolean(uuid)) || [],
          basePrice: data.basePrice ? Number(data.basePrice) : totalPrice?.toNumber() || 0,
          selectedServices: (selectedServices || orderData?.selectedServices || []).map(
            (service) => service.uuid,
          ), // Передаём только UUID
          assignedDriverId: selectedDriverInfo?.uuid || data.assignedDriverId || null,
          description: data.description.description || '',
          flightNumber: data.flightNumber.flightNumber || '',
          waitingTimeMinutes: waitTime || 0,
          fullName: data.fullName || undefined,
          phone: data.phone || undefined,
          status: data.status as OrderStatus,
        };
        apiUrl = mode === 'create' ? '/api/admin/orders' : `/api/admin/orders/${orderData?.uuid}`;
        method = mode === 'create' ? 'POST' : 'PUT';
      }

      // Отправка запроса на сервер
      try {
        const response = await fetch(apiUrl, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (response.ok) {
          showToast.success(
            mode === 'create' ? 'Заказ создан успешно!' : 'Заказ обновлён успешно!',
          );
          router.push('/orders');
        } else {
          const errorMessage = responseData.message || 'Неизвестная ошибка при сохранении заказа';
          showToast.error(`Ошибка: ${errorMessage}`);
        }
      } catch (error) {
        showToast.error(
          'Ошибка запроса: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'),
        );
      }
    },
    [
      role,
      mode,
      orderData,
      selectedTariff,
      departurePoint,
      arrivalPoint,
      selectedServices,
      totalPrice,
      waitTime,
      selectedDriverInfo,
      router,
    ],
  );
};
