import { createEvent, createStore } from 'effector';
export const openModal = createEvent();
export const closeModal = createEvent();
export const setCurrentPage = createEvent();
export const setEntityToDelete = createEvent();
export const $entityToDelete = createStore(null)
    .on(setEntityToDelete, (_, entity) => entity)
    .reset(closeModal);
export const setModalType = createEvent();
export const $modalType = createStore(null)
    .on(openModal, (_, modalType) => modalType)
    .on(setModalType, (_, modalType) => modalType)
    .reset(closeModal);
export const $currentPage = createStore(null).on(setCurrentPage, (_, page) => page);
export const triggerUpdate = createEvent();
export const $updateFlag = createStore(0).on(triggerUpdate, (state) => state + 1);
//Если ранее у вас использовалось хранилище для orderUuid, оставляем его:
export const setOrderUuid = createEvent();
export const $orderUuid = createStore(null)
    .on(setOrderUuid, (_, uuid) => uuid)
    .reset(closeModal);
//Хранилище для идентификатора пользователя
export const setUserUuid = createEvent();
export const $userUuid = createStore(null)
    .on(setUserUuid, (_, uuid) => uuid)
    .reset(closeModal);
//Хранилище для fullName пользователя
export const setUserFullName = createEvent();
export const $userFullName = createStore(null)
    .on(setUserFullName, (_, fullName) => fullName)
    .reset(closeModal);
export const setAdditionalServiceUuid = createEvent();
export const $additionalServiceUuid = createStore(null).on(setAdditionalServiceUuid, (_, uuid) => uuid);
//Состояние для хранения UUID точки прибытия
export const setPointUuid = createEvent();
export const $pointUuid = createStore(null).on(setPointUuid, (_, uuid) => uuid);
