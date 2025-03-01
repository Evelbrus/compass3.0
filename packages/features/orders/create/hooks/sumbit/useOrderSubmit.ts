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
  selectedServices: TariffOnService[];
  description: string;
  flightNumber: string;
  waitingTimeMinutes: number;
  status: OrderStatus;
}

// Тип для данных заказа для ролей Admin и Operator (создание и редактирование)
interface AdminOrderPayload {
  createdBy: string | undefined;
  tariffUuid: string | null;
  departureTime: Date;
  departurePoint: string | null;
  arrivalPoint: string | null;
  intermediatePoints: string[];
  basePrice: number;
  selectedServices: TariffOnService[];
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
      let payload: ClientCorpOrderPayload | AdminOrderPayload;
      let apiUrl: string;
      let method: 'POST' | 'PUT';

      // Проверка на режим редактирования только для Admin/Operator
      if (mode === 'edit' && role !== UserRole.ClientCorp && !orderData?.uuid) {
        showToast.error('Ошибка: отсутствует UUID заказа для редактирования');
        return;
      }

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
          selectedServices: selectedServices || orderData?.selectedServices || [],
          description: '',
          flightNumber: '',
          waitingTimeMinutes: waitTime || 0,
          status: data.status as OrderStatus,
        };
        apiUrl = '/api/client-corp/orders';
        method = 'POST'; // Только создание для ClientCorp
      }
      // Admin и Operator могут создавать и редактировать заказы
      else {
        const isNewClientMode = !!data.fullName && !!data.phone;
        payload = {
          createdBy: isNewClientMode
            ? undefined
            : orderData?.createdBy?.uuid || data.createdBy?.uuid,
          tariffUuid: selectedTariff?.uuid || orderData?.tariff?.uuid || null,
          departureTime: data.departureTime || new Date(),
          departurePoint: departurePoint?.uuid || data.departurePoint?.uuid || null,
          arrivalPoint: arrivalPoint?.uuid || data.arrivalPoint?.uuid || null,
          intermediatePoints:
            data.intermediatePoints
              ?.map((point) => point?.uuid)
              .filter((uuid): uuid is string => Boolean(uuid)) || [],
          basePrice: data.basePrice ? Number(data.basePrice) : totalPrice?.toNumber() || 0,
          selectedServices: selectedServices || orderData?.selectedServices || [],
          assignedDriverId: selectedDriverInfo?.uuid || data.assignedDriverId || null,
          description: '',
          flightNumber: '',
          waitingTimeMinutes: waitTime || 0,
          fullName: data.fullName || undefined,
          phone: data.phone || undefined,
          status: data.status as OrderStatus,
        };
        apiUrl = mode === 'create' ? '/api/orders' : `/api/orders/${orderData?.uuid}`;
        method = mode === 'create' ? 'POST' : 'PUT'; // Поддержка создания и редактирования
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
            mode === 'create' ? 'Заказ создан успешно!' : 'Заказ обновлен успешно!',
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
