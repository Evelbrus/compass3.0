'use client';

import { Tariff, TariffOnService } from '@prisma/client';
import React from 'react';
import { FormProvider } from 'react-hook-form';
import {
  TariffAdditionalServices,
  TariffGeneralInfo,
  TariffParameters,
} from '@features/tariffs/ui/steps';
import FormTabs, { TabItem } from '@widgets/navigations/tabs/FormTabs';
import FormNavigationButtons from '@widgets/navigations/form/FormNavigationButtons';
import { TariffFormData } from '@features/tariffs/hooks/create/useTariffCreateForm';
import { useTariffCreateForm } from '@features/tariffs/hooks/create/useTariffCreateForm';
import { useTariffSubmit } from '@features/tariffs/hooks/useTariffSubmit';
import { handleFinish, useTabNavigation } from '@shared/lib/navigation';
import { ValidationConfig } from '@shared/lib/navigation/useTabNavigation';
import { openWarningModal, closeModal } from '@shared/lib/effector';

interface TariffFormPageProps {
  mode: 'create' | 'edit';
  tariffData?: Tariff & { tariffAdditionalServices: TariffOnService[] };
}

const TariffFormPage: React.FC<TariffFormPageProps> = ({ mode, tariffData }) => {
  console.log('tariffData', tariffData);

  // Списки полей для валидации на разных шагах
  const generalFieldsToValidate = ['name', 'vehicleType', 'serviceLevel', 'price'];
  const parametersFieldsToValidate = [
    'freeWaitTimeBishkek',
    'pricePerMinuteAfterBishkek',
    'freeWaitTimeAirport',
    'pricePerMinuteAfterAirport',
  ];

  // Конфигурация валидации для переходов между вкладками
  const validationConfig: ValidationConfig[] = [
    {
      sourceTabId: 'general',
      targetTabId: 'parameters',
      fieldsToValidate: generalFieldsToValidate,
      errorMessage: 'Пожалуйста, заполните все обязательные поля',
    },
    {
      sourceTabId: 'general',
      targetTabId: 'services',
      fieldsToValidate: [...generalFieldsToValidate, ...parametersFieldsToValidate],
      errorMessage: 'Пожалуйста, заполните все обязательные поля',
    },
    {
      sourceTabId: 'parameters',
      targetTabId: 'services',
      fieldsToValidate: parametersFieldsToValidate,
      errorMessage: 'Пожалуйста, заполните все обязательные поля',
    },
  ];

  // Определяем вкладки для формы
  const tabItems: TabItem[] = [
    { id: 'general', label: 'Основная информация' },
    { id: 'parameters', label: 'Параметры' },
    { id: 'services', label: 'Дополнительные услуги' },
  ];

  const {
    formMethods,
    additionalServices,
    handleInputChange,
    handleAddAdditionalService,
    handleRemoveAdditionalService,
    handleLocalChange,
    handleFreeWaitTimeChange,
    hasAdditionalServices,
    handleGoToServicesSelection,
  } = useTariffCreateForm({ tariffData });

  // Используем хук для навигации по вкладкам
  const { activeTab, tabsRef, onNextStep, onPrevStep, onTabChange } =
    useTabNavigation<TariffFormData>({
      formMethods,
      initialTab: 'general',
      validationConfig,
    });

  // Используем отдельный хук для отправки формы
  const { handleSubmit } = useTariffSubmit({ mode, tariffData });

  // Обработчик завершения формы
  const onFinish = () => {
    handleFinish(
      // Проверка условия: есть выбранные услуги или это режим редактирования
      () => hasAdditionalServices || mode === 'edit',
      // Отправка формы
      () => formMethods.handleSubmit(handleSubmit)(),
      // Показ предупреждения через openWarningModal
      () =>
        openWarningModal({
          title: 'Услуги не выбраны',
          message:
            'Вы не выбрали дополнительные услуги для тарифа. Вы уверены, что хотите создать тариф без назначения услуг?',
          confirmButtonText: 'Создать без услуг',
          cancelButtonText: 'Выбрать услуги',
          onConfirm: () => {
            formMethods.handleSubmit(handleSubmit)();
            closeModal();
          },
          onCancel: () => {
            handleGoToServicesSelection();
            closeModal();
          },
        }),
    );
  };

  // Обработчики для навигации между вкладками
  const handleNextStep = () => {
    if (activeTab === 'general') {
      onNextStep('general', 'parameters', generalFieldsToValidate);
    } else if (activeTab === 'parameters') {
      onNextStep('parameters', 'services', parametersFieldsToValidate);
    }
  };

  const handlePrevStep = () => {
    if (activeTab === 'services') {
      onPrevStep('parameters');
    } else if (activeTab === 'parameters') {
      onPrevStep('general');
    }
  };

  return (
    <div className="min-h-screen">
      <div className="w-full">
        <FormProvider {...formMethods}>
          <form className="flex flex-col px-6">
            {/* Используем компонент FormTabs */}
            <FormTabs
              tabs={tabItems}
              activeTab={activeTab}
              onTabChange={onTabChange}
              tabsRef={tabsRef}
            />

            {/* Переключение компонентов */}
            {activeTab === 'general' && <TariffGeneralInfo handleInputChange={handleInputChange} />}
            {activeTab === 'parameters' && (
              <TariffParameters
                handleInputChange={handleInputChange}
                handleFreeWaitTimeChange={handleFreeWaitTimeChange}
              />
            )}
            {activeTab === 'services' && (
              <TariffAdditionalServices
                additionalServices={additionalServices}
                handleAddAdditionalService={handleAddAdditionalService}
                handleRemoveAdditionalService={handleRemoveAdditionalService}
                handleLocalChange={handleLocalChange}
              />
            )}

            {/* Кнопки навигации между шагами */}
            <FormNavigationButtons
              activeTab={activeTab}
              mode={mode}
              isLastStep={activeTab === 'services'}
              entityName="тариф"
              onPrevStep={handlePrevStep}
              onNextStep={handleNextStep}
              onCancel={() => window.history.back()}
              onFinish={onFinish}
            />
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default TariffFormPage;
