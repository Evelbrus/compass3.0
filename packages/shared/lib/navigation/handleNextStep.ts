// handleNextStep.ts
'use client';

import { Dispatch, SetStateAction, RefObject } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { showToast } from '@shared/components/toast/ToastManager';
import { scrollToElement } from '@shared/lib/navigation/index';


/**
 * Интерфейс для параметров функции перехода на следующий шаг
 */
interface NextStepOptions<T extends FieldValues = FieldValues> {
  formMethods?: UseFormReturn<T>; // Методы формы из react-hook-form
  setActiveTab: Dispatch<SetStateAction<string>>; // Функция для изменения активной вкладки
  fieldsToValidate?: string[]; // Поля для валидации при переходе на следующий шаг
}

/**
 * Функция для перехода к следующему шагу формы с валидацией полей
 * @param options параметры навигации
 * @param nextTabId ID следующей вкладки
 * @param scrollRef ссылка на DOM-элемент для скролла
 * @param errorMessage сообщение об ошибке, если валидация не пройдена
 */
export const handleNextStep = async <T extends FieldValues>(
  options: NextStepOptions<T>,
  nextTabId: string,
  scrollRef: RefObject<HTMLElement | null>,
  errorMessage = 'Пожалуйста, заполните все обязательные поля',
) => {
  // Если есть поля для валидации и formMethods, проверяем их
  if (options.fieldsToValidate && options.fieldsToValidate.length > 0 && options.formMethods) {
    const result = await options.formMethods.trigger(options.fieldsToValidate as any);

    if (result) {
      options.setActiveTab(nextTabId);
      scrollToElement(scrollRef);
    } else {
      showToast.error(errorMessage);
    }
  } else {
    // Если нет полей для валидации или formMethods, просто переходим на следующий шаг
    options.setActiveTab(nextTabId);
    scrollToElement(scrollRef);
  }
};

export default handleNextStep;
