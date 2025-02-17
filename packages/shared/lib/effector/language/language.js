import { createStore, createEvent } from 'effector';
export const setLang = createEvent();
export const $lang = createStore('ru-RU').on(setLang, (_, newLang) => newLang);
