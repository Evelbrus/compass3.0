import { useState, useRef } from 'react';
import { UseFormReturn, FieldValues } from 'react-hook-form';
import { handleNextStep, handlePrevStep, handleTabChange } from '@shared/lib/navigation';

export interface ValidationConfig {
  sourceTabId: string;
  targetTabId: string;
  fieldsToValidate: string[];
  errorMessage: string;
}

interface UseTabNavigationProps<T extends FieldValues = FieldValues> {
  formMethods: UseFormReturn<T>;
  initialTab?: string;
  validationConfig?: ValidationConfig[];
}

export function useTabNavigation<T extends FieldValues = FieldValues>({
  formMethods,
  initialTab = 'general',
  validationConfig = [],
}: UseTabNavigationProps<T>) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Обработчик перехода на следующий шаг
  const onNextStep = async (
    currentTab: string,
    nextTab: string,
    fieldsToValidate: string[],
    errorMessage = 'Пожалуйста, заполните все обязательные поля',
  ) => {
    const nextStepOptions = {
      formMethods,
      setActiveTab,
      fieldsToValidate,
    };
    await handleNextStep(
      nextStepOptions,
      nextTab,
      tabsRef,
      errorMessage,
    );
  };

  // Обработчик возврата к предыдущему шагу
  const onPrevStep = (prevTab: string) => {
    handlePrevStep({ setActiveTab }, prevTab, tabsRef);
  };

  // Обработчик смены вкладки через навигацию
  const onTabChange = async (
    tab: string,
    useValidation = true,
    customValidationConfig: ValidationConfig[] = [],
  ) => {
    if (tab === activeTab) return; // Ничего не делаем, если вкладка уже активна

    // Используем переданную конфигурацию валидации или внутреннюю
    const config = customValidationConfig.length > 0 ? customValidationConfig : validationConfig;

    const tabChangeOptions = {
      formMethods,
      setActiveTab,
    };

    await handleTabChange(
      tabChangeOptions,
      tab,
      activeTab,
      tabsRef,
      useValidation,
      config,
    );
  };

  return {
    activeTab,
    setActiveTab,
    tabsRef,
    onNextStep,
    onPrevStep,
    onTabChange,
  };
}

export default useTabNavigation;
