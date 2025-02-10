import { createEvent, createStore } from 'effector';
import { PrivatePageType } from '@shared/utils/routing';
import { OrderStatus, UserRole } from '@prisma/client';

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
  | null;

export type EntityToDelete = {
  entity?: 'users' | 'orders' | 'vehicles';
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

export const $modalType = createStore<ModalType>(null)
  .on(openModal, (_, modalType) => modalType)
  .reset(closeModal);

export const $currentPage = createStore<PrivatePageType | null>(null).on(
  setCurrentPage,
  (_, page) => page,
);

export const triggerUpdate = createEvent();

export const $updateFlag = createStore(0).on(triggerUpdate, (state) => state + 1);

export const selectStatus = createEvent<OrderStatus>();

export const resetSelectedStatus = createEvent();

export const $selectedStatus = createStore<OrderStatus | null>(null)
  .on(selectStatus, (_, status) => status)
  .reset(resetSelectedStatus);

//New store and event for selectedOrderUuid
export const setOrderUuid = createEvent<string | null>();
export const $orderUuid = createStore<string | null>(null)
  .on(setOrderUuid, (_, uuid) => uuid)
  .reset(closeModal); //Reset when modal closes
