'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider } from 'react-hook-form';
import { CompanyProfile, DriverExperience, DriverProfile, User, UserRole } from '@prisma/client';
import ClientForm from '@pages/(administrator)/(users)/user/client/ClientForm';
import ClientCorpForm from '@pages/(administrator)/(users)/user/client-corp/ClientCorpForm';
import DriverForm from '@pages/(administrator)/(users)/user/driver/DriverForm';
import OperatorForm from '@pages/(administrator)/(users)/user/operator/OperatorForm';
import AdminForm from '@pages/(administrator)/(users)/user/admin/AdminForm';
import { openModal, setUserFullName, setUserUuid } from '@shared/lib/effector';
import FormNavigationButtons from '@widgets/navigations/form/FormNavigationButtons';
import useClientsAdminForm from '@features/users/hooks/useClientsAdminForm';
import useClientsAdminSubmit from '@features/users/hooks/useClientsAdminSubmit';
import FormTabs, { TabItem } from '@widgets/navigations/tabs/FormTabs';

interface ClientsAdminPageProps {
  mode: 'create' | 'edit';
  role?: UserRole;
  userData?:
    | (User & {
        companyProfile?: CompanyProfile | null;
        driverProfile?: (DriverProfile & { driverExperience?: DriverExperience | null }) | null;
      })
    | null;
}

const CreateUserAdminPage: React.FC<ClientsAdminPageProps> = ({ mode, role, userData }) => {
  const router = useRouter();

  console.log('userData', userData);

  // Использование хука для управления формой
  const {
    formMethods,
    currentStep,
    setCurrentStep,
    finalStep,
    previewImage,
    previewLogo,
    driverProfilePhotoPreview,
    passportPreview,
    licensePreview,
    handleNextStep,
    handleTabChange,
    customValidateAndSubmit,
    setPreviewImage,
    setPreviewLogo,
    setDriverProfilePhotoPreview,
    setPassportPreview,
    setLicensePreview,
    finalRole,
  } = useClientsAdminForm({ mode, role, userData });

  // Использование хука для отправки формы
  const { handleSubmit } = useClientsAdminSubmit({ mode, userData, finalRole });

  const formProps = { mode, control: formMethods.control, profilePhotoPath: previewImage };

  // Функция для рендеринга табов в зависимости от типа пользователя и шага
  const renderTabs = () => {
    let tabs: TabItem[] = [];

    switch (finalRole) {
      case UserRole.Client:
        tabs = [{ id: '1', label: 'Основная информация' }];
        break;
      case UserRole.ClientCorp:
        tabs = [
          { id: '1', label: 'Основная информация' },
          { id: '2', label: 'Логотип' },
        ];
        break;
      case UserRole.Driver:
        tabs = [
          { id: '1', label: 'Основная информация' },
          { id: '2', label: 'Паспортные данные' },
          { id: '3', label: 'Водительский опыт' },
          { id: '4', label: 'Паспорт' },
          { id: '5', label: 'Водительское удостоверение' },
        ];
        break;
      case UserRole.Operator:
        tabs = [
          { id: '1', label: 'Основная информация' },
          { id: '2', label: 'Данные оператора' },
        ];
        break;
      case UserRole.Admin:
        tabs = [{ id: '1', label: 'Основная информация' }];
        break;
      default:
        return null;
    }

    return (
      <FormTabs tabs={tabs} activeTab={currentStep.toString()} onTabChange={handleTabChange} />
    );
  };

  const renderForm = () => {
    switch (finalRole) {
      case UserRole.Client:
        return <ClientForm {...formProps} setPreview={setPreviewImage} />;
      case UserRole.ClientCorp:
        return (
          <ClientCorpForm
            {...formProps}
            logoImageSrc={previewLogo}
            currentStep={currentStep}
            setImagePreview={setPreviewImage}
            setLogoPreview={setPreviewLogo}
          />
        );
      case UserRole.Driver:
        return (
          <DriverForm
            {...formProps}
            driverProfilePhotoSrc={driverProfilePhotoPreview}
            passportPhotoSrc={passportPreview}
            licenseSrc={licensePreview}
            currentStep={currentStep}
            setImagePreview={setPreviewImage}
            setDriverProfilePhotoPreview={setDriverProfilePhotoPreview}
            setPassportPreview={setPassportPreview}
            setLicensePreview={setLicensePreview}
          />
        );
      case UserRole.Operator:
        return (
          <OperatorForm
            {...formProps}
            logoImageSrc={previewLogo}
            currentStep={currentStep}
            setImagePreview={setPreviewImage}
            setLogoPreview={setPreviewLogo}
          />
        );
      case UserRole.Admin:
        return <AdminForm {...formProps} setPreview={setPreviewImage} />;
      default:
        return <div>Unknown user role</div>;
    }
  };

  // Обработчик для перехода назад
  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  // Обработчик отправки формы только со встроенной проверкой
  const handleFormFinish = () => {
    customValidateAndSubmit(handleSubmit);
  };

  // Предотвращаем стандартную отправку формы с полной валидацией
  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === finalStep) {
      handleFormFinish();
    }
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onFormSubmit} className="flex flex-col px-6">
        {mode === 'edit' && userData?.uuid && (
          <div className={'flex flex-row justify-end gap-2'}>
            <button
              type="button"
              onClick={() => {
                formMethods.setValue('availability', !formMethods.getValues('availability'));
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors ml-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {formMethods.watch('availability') ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                )}
              </svg>
              {formMethods.watch('availability') ? 'Активен' : 'Не активен'}
            </button>
            <button
              type="button"
              onClick={() => {
                setUserUuid(userData.uuid);
                setUserFullName(userData.fullName);
                openModal('changePasswordModal');
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors ml-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
              Изменить пароль
            </button>
          </div>
        )}
        {renderTabs()}
        {renderForm()}
        <FormNavigationButtons
          activeTab={currentStep.toString()}
          mode={mode}
          isLastStep={currentStep === finalStep}
          entityName={finalRole.toLowerCase()}
          onPrevStep={handlePrevStep}
          onNextStep={handleNextStep}
          onCancel={() => router.back()}
          onFinish={handleFormFinish}
          customFinishButtonText={mode === 'create' ? 'Создать' : 'Сохранить'}
        />
      </form>
    </FormProvider>
  );
};

export default CreateUserAdminPage;
