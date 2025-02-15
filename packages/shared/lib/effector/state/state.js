import { createEvent, createStore } from 'effector';
export const openModal = createEvent();
export const closeModal = createEvent();
export const setCurrentPage = createEvent();
export const setEntityToDelete = createEvent();
export const $entityToDelete = createStore(null)
    .on(setEntityToDelete, (_, entity) => entity)
    .reset(closeModal);
export const $modalType = createStore(null)
    .on(openModal, (_, modalType) => modalType)
    .reset(closeModal);
export const $currentPage = createStore(null).on(setCurrentPage, (_, page) => page);
export const triggerUpdate = createEvent();
export const $updateFlag = createStore(0).on(triggerUpdate, (state) => state + 1);
export const selectStatus = createEvent();
export const resetSelectedStatus = createEvent();
export const $selectedStatus = createStore(null)
    .on(selectStatus, (_, status) => status)
    .reset(resetSelectedStatus);
//New store and event for selectedOrderUuid
export const setOrderUuid = createEvent();
export const $orderUuid = createStore(null)
    .on(setOrderUuid, (_, uuid) => uuid)
    .reset(closeModal); //Reset when modal closes
