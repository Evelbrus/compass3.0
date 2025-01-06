import { createEvent, createStore } from 'effector';

// Интерфейс для текущей сущности и статуса
export interface CurrentEntityStatus {
  entity: string;
  status: string | null;
}

// Событие для обновления текущей сущности и статуса
export const setCurrentEntityStatus = createEvent<CurrentEntityStatus>();

// Хранилище для текущей сущности и статуса
export const $currentEntityStatus = createStore<CurrentEntityStatus>({
  entity: 'DEFAULT',
  status: 'DEFAULT',
}).on(setCurrentEntityStatus, (_, payload) => payload);
