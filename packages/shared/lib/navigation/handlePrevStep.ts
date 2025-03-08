// handlePrevStep.ts
'use client';

import { Dispatch, SetStateAction, RefObject } from 'react';
import { scrollToElement } from '@shared/lib/navigation/index';
import { FieldValues } from 'react-hook-form';

/**
 * Интерфейс для параметров функции перехода на предыдущий шаг
 */
interface PrevStepOptions<T extends FieldValues = FieldValues> {
  setActiveTab: Dispatch<SetStateAction<string>>; // Функция для изменения активной вкладки
}

/**
 * Функция для перехода к предыдущему шагу формы
 * @param options параметры навигации
 * @param prevTabId ID предыдущей вкладки
 * @param scrollRef ссылка на DOM-элемент для скролла
 */
export const handlePrevStep = <T extends FieldValues>(
  options: PrevStepOptions<T>,
  prevTabId: string,
  scrollRef: RefObject<HTMLElement | null>,
) => {
  options.setActiveTab(prevTabId);
  scrollToElement(scrollRef);
};

export default handlePrevStep;
