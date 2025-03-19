import { createEvent, createStore } from 'effector';
import { PrivatePageType } from '@shared/utils/routing';
import { UserRole, type Notification as PrismaNotification } from '@prisma/client';

export type ModalType =
  | 'createUserModal'
  | 'deleteModal'
  | 'createTariffModal'
  | 'orderDetailDriver'
  | 'vehicleDetail'
  | 'createClientCorpOrder'
  | 'changePasswordModal'
  | 'createAdditionalServiceModal'
  | 'createPointModal'
  | 'orderInfoModal'
  | 'orderProgressModal'
  | 'warningAdminModal'
  | 'orderDriverModal'
  | 'orderTrackingModal'
  | 'orderAdminModal'
  | null;

export type EntityToDelete = {
  entity?: 'users' | 'orders' | 'vehicles' | 'additional-services' | 'points';
  uuid?: string;
  role?: UserRole;
} | null;

// Тип пропсов для WarningModal
export type WarningModalProps = {
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const openModal = createEvent<ModalType | null>();
export const setModalType = createEvent<ModalType | null>();
export const closeModal = createEvent();
export const setCurrentPage = createEvent<PrivatePageType>();
export const setEntityToDelete = createEvent<EntityToDelete>();
export const openWarningModal = createEvent<WarningModalProps>(); // Событие для открытия WarningModal

export const $entityToDelete = createStore<EntityToDelete>(null)
  .on(setEntityToDelete, (_, entity) => entity)
  .reset(closeModal);

export const $modalType = createStore<ModalType | null>(null)
  .on(openModal, (_, modalType) => modalType)
  .on(setModalType, (_, modalType) => modalType)
  .reset(closeModal);

// Хранилище для активного уведомления с типом PrismaNotification
export const setActiveNotification = createEvent<PrismaNotification | null>();
export const $activeNotification = createStore<PrismaNotification | null>(null)
  .on(setActiveNotification, (_, notification) => notification)
  .reset(closeModal);

// Хранилище для пропсов WarningModal
export const $warningModalProps = createStore<WarningModalProps | null>(null)
  .on(openWarningModal, (_, props) => props)
  .reset(closeModal);

export const $currentPage = createStore<PrivatePageType | null>(null).on(
  setCurrentPage,
  (_, page) => page,
);

export const triggerUpdate = createEvent();
export const $updateFlag = createStore(0).on(triggerUpdate, (state) => state + 1);

// Хранилище для orderUuid
export const setOrderUuid = createEvent<string | null>();
export const $orderUuid = createStore<string | null>(null)
  .on(setOrderUuid, (_, uuid) => uuid)
  .reset(closeModal);

// Хранилище для идентификатора пользователя
export const setUserUuid = createEvent<string | null>();
export const $userUuid = createStore<string | null>(null)
  .on(setUserUuid, (_, uuid) => uuid)
  .reset(closeModal);

// Хранилище для fullName пользователя
export const setUserFullName = createEvent<string | null>();
export const $userFullName = createStore<string | null>(null)
  .on(setUserFullName, (_, fullName) => fullName)
  .reset(closeModal);

export const setAdditionalServiceUuid = createEvent<string | null>();
export const $additionalServiceUuid = createStore<string | null>(null).on(
  setAdditionalServiceUuid,
  (_, uuid) => uuid,
);

// Хранилище для UUID точки прибытия
export const setPointUuid = createEvent<string | null>();
export const $pointUuid = createStore<string | null>(null).on(setPointUuid, (_, uuid) => uuid);

// Хранилище для идентификатора автомобиля
export const setVehicleUuid = createEvent<string | null>();
export const $vehicleUuid = createStore<string | null>(null)
  .on(setVehicleUuid, (_, uuid) => uuid)
  .reset(closeModal);
