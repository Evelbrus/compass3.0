'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';
import FormTabs, { TabItem } from '@widgets/navigations/tabs/FormTabs';
import FormNavigationButtons from '@widgets/navigations/form/FormNavigationButtons';
import { VehicleData } from '@features/vehicles/hooks/create/useVehiclesCreateForm';
import { useVehiclesCreateForm } from '@features/vehicles/hooks/create/useVehiclesCreateForm';
import { useVehiclesSubmit } from '@features/vehicles/hooks/create/useVehiclesSubmit';
import { VehicleDriversAssignment, VehicleMainInfoForm } from '@features/vehicles/ui/step';
import { handleFinish, useTabNavigation } from '@shared/lib/navigation';
import { ValidationConfig } from '@shared/lib/navigation/useTabNavigation';
import { openWarningModal, closeModal } from '@shared/lib/effector';

interface VehiclesFormProps {
  mode: 'create' | 'edit';
  vehicleData?: VehicleData;
}

const VehiclesFormPage: React.FC<VehiclesFormProps> = ({ mode, vehicleData }) => {
  const requiredFields = [
    'vehicleType',
    'serviceLevels',
    'brand',
    'model',
    'year',
    'color',
    'plateNumber',
    'ownership',
  ];

  // Конфигурация валидации для переходов между вкладками
  const validationConfig: ValidationConfig[] = [
    {
      sourceTabId: 'general',
      targetTabId: 'drivers',
      fieldsToValidate: requiredFields,
      errorMessage: 'Пожалуйста, заполните все обязательные поля',
    },
  ];

  // Определяем вкладки для формы
  const tabItems: TabItem[] = [
    { id: 'general', label: 'Основная информация' },
    { id: 'drivers', label: 'Назначение водителей' },
  ];

  // Получаем данные и методы для формы
  const {
    formMethods,
    previewImage,
    drivers,
    onSelectDriver,
    onRemoveDriver,
    observerRef,
    scrollContainerRef,
    searchTerm,
    handleSearchChange,
    hasSelectedDrivers,
    handleGoToDriverSelection,
  } = useVehiclesCreateForm({ vehicleData });

  // Используем хук для навигации по вкладкам
  const { activeTab, tabsRef, onNextStep, onPrevStep, onTabChange } = useTabNavigation<VehicleData>(
    {
      formMethods,
      initialTab: 'general',
      validationConfig,
    },
  );

  // Используем отдельный хук для отправки формы
  const { handleSubmit } = useVehiclesSubmit({ mode, vehicleData });

  // Обработчик завершения формы
  const onFinish = () => {
    handleFinish(
      // Проверка условия: есть выбранные водители или это режим редактирования
      () => hasSelectedDrivers || mode === 'edit',
      // Отправка формы
      () => formMethods.handleSubmit(handleSubmit)(),
      // Показ предупреждения через openWarningModal
      () =>
        openWarningModal({
          title: 'Водитель не выбран',
          message:
            'Вы не выбрали водителя для автомобиля. Вы уверены, что хотите создать автомобиль без назначения водителя?',
          confirmButtonText: 'Создать без водителя',
          cancelButtonText: 'Выбрать водителя',
          onConfirm: () => {
            formMethods.handleSubmit(handleSubmit)();
            closeModal();
          },
          onCancel: () => {
            handleGoToDriverSelection();
            closeModal();
          },
        }),
    );
  };

  const handleNextStep = () => onNextStep('general', 'drivers', requiredFields);
  const handlePrevStep = () => onPrevStep('general');

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
            {activeTab === 'general' && <VehicleMainInfoForm previewImage={previewImage} />}
            {activeTab === 'drivers' && (
              <VehicleDriversAssignment
                drivers={drivers}
                onSelectDriver={onSelectDriver}
                onRemoveDriver={onRemoveDriver}
                searchTerm={searchTerm}
                handleSearchChange={handleSearchChange}
                observerRef={observerRef as React.RefObject<HTMLDivElement>}
                scrollContainerRef={scrollContainerRef as React.RefObject<HTMLDivElement>}
              />
            )}

            {/* Кнопки навигации между шагами */}
            <FormNavigationButtons
              activeTab={activeTab}
              mode={mode}
              isLastStep={activeTab === 'drivers'}
              entityName="автомобиль"
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

export default VehiclesFormPage;
