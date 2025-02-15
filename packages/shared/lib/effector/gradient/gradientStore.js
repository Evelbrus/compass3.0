import { createEvent, createStore } from 'effector';
// Событие для обновления текущей сущности и статуса
export const setCurrentEntityStatus = createEvent();
// Хранилище для текущей сущности и статуса
export const $currentEntityStatus = createStore({
    entity: 'DEFAULT',
    status: 'DEFAULT',
}).on(setCurrentEntityStatus, (_, payload) => payload);
