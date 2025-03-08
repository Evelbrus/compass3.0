// handleTabChange.ts
'use client';

import { Dispatch, SetStateAction, RefObject } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { handleNextStep, scrollToElement } from '@shared/lib/navigation/index';

/**
 * Интерфейс для параметров функции смены вкладки
 */
interface TabChangeOptions<T extends FieldValues = FieldValues> {
  formMethods?: UseFormReturn<T>; // Методы формы из react-hook-form
  setActiveTab: Dispatch<SetStateAction<string>>; // Функция для изменения активной вкладки
  fieldsToValidate?: string[]; // Поля для валидации при переходе на следующий шаг
}

/**
 * Интерфейс для конфигурации валидации при переходе между вкладками
 */
interface ValidationConfig {
  targetTabId: string; // ID вкладки, на которую осуществляется переход
  sourceTabId: string; // ID вкладки, с которой осуществляется переход
  fieldsToValidate: string[]; // Поля для валидации
  errorMessage?: string; // Сообщение об ошибке
}

/**
 * Функция для изменения вкладки через навигацию
 * @param options параметры навигации
 * @param tabId ID вкладки, на которую нужно перейти
 * @param currentTabId ID текущей вкладки
 * @param scrollRef ссылка на DOM-элемент для скролла
 * @param requiresValidation флаг, указывающий, требуется ли валидация при переходе на определенные вкладки
 * @param validationConfig объект с конфигурацией валидации для разных переходов
 */
export const handleTabChange = async <T extends FieldValues>(
  options: TabChangeOptions<T>,
  tabId: string,
  currentTabId: string,
  scrollRef: RefObject<HTMLElement | null>,
  requiresValidation = false,
  validationConfig?: ValidationConfig[],
) => {
  // Если для перехода требуется валидация и есть конфигурация валидации
  if (requiresValidation && validationConfig && validationConfig.length > 0) {
    // Ищем конфигурацию для текущего перехода
    const config = validationConfig.find(
      (config) => config.targetTabId === tabId && config.sourceTabId === currentTabId,
    );

    // Если конфигурация найдена, выполняем валидацию
    if (config) {
      const nextStepOptions = {
        formMethods: options.formMethods,
        setActiveTab: options.setActiveTab,
        fieldsToValidate: config.fieldsToValidate,
      };
      await handleNextStep(
        nextStepOptions,
        tabId,
        scrollRef,
        config.errorMessage,
      );
      return;
    }
  }

  // Если валидация не требуется или конфигурация не найдена, просто меняем вкладку
  options.setActiveTab(tabId);
  scrollToElement(scrollRef);
};

export default handleTabChange;
