// scrollToElement.ts
'use client';

import { RefObject } from 'react';

/**
 * Функция для скролла к началу страницы
 * @param scrollRef не используется, сохранен для обратной совместимости
 */
export const scrollToElement = (scrollRef?: RefObject<HTMLElement | null>) => {
  // Всегда скроллим к началу страницы независимо от переданного ref
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

export default scrollToElement;
