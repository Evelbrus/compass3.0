import { createStore, createEvent } from 'effector';

export const setLang = createEvent<string>();

export const $lang = createStore<string>('ru-RU').on(setLang, (_, newLang) => newLang);
