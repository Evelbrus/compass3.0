import { createEvent, createStore } from 'effector';
import { PrivatePageType } from '@shared/utils/routing';
import { Action, OrderStatus, UserRole } from '@prisma/client';

//Остальные типы и события
export type View =
  | 'form'
  | 'skeleton'
  | 'example'
  | 'loading'
  | 'data'
  | 'noData'
  | 'success'
  | 'error';

export type ModalType =
  | 'createUserModal'
  | 'deleteModal'
  | 'createTariffModal'
  | 'orderDetailDriver'
  | 'createClientCorpOrder'
  | 'changePasswordModal'
  | 'createAdditionalServiceModal'
  | 'createPointModal'
  | 'orderInfoModal'
  | 'orderProgressModal'
  | null;

export type EntityToDelete = {
  entity?: 'users' | 'orders' | 'vehicles' | 'additional-services' | 'points';
  uuid?: string;
  role?: UserRole;
} | null;

export const openModal = createEvent<ModalType>();
export const closeModal = createEvent();
export const setCurrentPage = createEvent<PrivatePageType>();
export const setEntityToDelete = createEvent<EntityToDelete>();

export const $entityToDelete = createStore<EntityToDelete>(null)
  .on(setEntityToDelete, (_, entity) => entity)
  .reset(closeModal);

export const setModalType = createEvent<ModalType | null>();
export const $modalType = createStore<ModalType | null>(null)
  .on(openModal, (_, modalType) => modalType)
  .on(setModalType, (_, modalType) => modalType)
  .reset(closeModal);

export const $currentPage = createStore<PrivatePageType | null>(null).on(
  setCurrentPage,
  (_, page) => page,
);

export const triggerUpdate = createEvent();
export const $updateFlag = createStore(0).on(triggerUpdate, (state) => state + 1);

//Если ранее у вас использовалось хранилище для orderUuid, оставляем его:
export const setOrderUuid = createEvent<string | null>();
export const $orderUuid = createStore<string | null>(null)
  .on(setOrderUuid, (_, uuid) => uuid)
  .reset(closeModal);

//Хранилище для идентификатора пользователя
export const setUserUuid = createEvent<string | null>();
export const $userUuid = createStore<string | null>(null)
  .on(setUserUuid, (_, uuid) => uuid)
  .reset(closeModal);

//Хранилище для fullName пользователя
export const setUserFullName = createEvent<string | null>();
export const $userFullName = createStore<string | null>(null)
  .on(setUserFullName, (_, fullName) => fullName)
  .reset(closeModal);

export const setAdditionalServiceUuid = createEvent<string | null>();
export const $additionalServiceUuid = createStore<string | null>(null).on(
  setAdditionalServiceUuid,
  (_, uuid) => {
    return uuid;
  },
);

//Состояние для хранения UUID точки прибытия
export const setPointUuid = createEvent<string | null>();
export const $pointUuid = createStore<string | null>(null).on(setPointUuid, (_, uuid) => {
  return uuid;
});

//Создаём отдельное хранилище для uuid заказа, относящегося к модальному окну водителя
export const setDriverOrderUuid = createEvent<string | null>();
export const $driverOrderUuid = createStore<string | null>(null)
  .on(setDriverOrderUuid, (_, uuid) => uuid)
  .reset(closeModal);

//Интерфейс для уведомлений (можно переиспользовать Notification из вашего кода)
export interface WarningNotification {
  uuid: string;
  orderId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  action: Action; //здесь значение должно быть Action.warning
}

//Событие для добавления нового warning-уведомления
export const addWarningNotification = createEvent<WarningNotification>();

//Событие для очистки всех warning-уведомлений (если потребуется)
export const clearWarningNotifications = createEvent();

//Хранилище для массива warning-уведомлений
export const $warningNotifications = createStore<WarningNotification[]>([])
  .on(addWarningNotification, (state, warning) => [warning, ...state])
  .reset(clearWarningNotifications);
