'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider } from 'react-hook-form';
import { UserRole } from '@prisma/client';

import ClientForm from '@pages/(administrator)/(users)/user/client/ClientForm';
import ClientCorpForm from '@pages/(administrator)/(users)/user/client-corp/ClientCorpForm';
import DriverForm from '@pages/(administrator)/(users)/user/driver/DriverForm';
import OperatorForm from '@pages/(administrator)/(users)/user/operator/OperatorForm';
import AdminForm from '@pages/(administrator)/(users)/user/admin/AdminForm';
import useClientsAdminForm, {
  UserCard,
} from '@pages/(administrator)/(users)/user/useClientsAdminForm';
import { openModal, setUserFullName, setUserUuid } from '@shared/lib/effector';

interface ClientsAdminPageProps {
  mode: 'create' | 'edit';
  role?: UserRole;
  userData?: UserCard;
}

const ClientsAdminPage: React.FC<ClientsAdminPageProps> = ({ mode, role, userData }) => {
  const router = useRouter();

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
    onSubmit,
    setPreviewImage,
    setPreviewLogo,
    setDriverProfilePhotoPreview,
    setPassportPreview,
    setLicensePreview,
    finalRole,
  } = useClientsAdminForm({ mode, role, userData });

  const formProps = { mode, control: formMethods.control, profilePhotoPath: previewImage };

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

  const renderNavigationButtons = () => {
    return (
      <div className={'w-full flex justify-end gap-4'}>
        <button
          type="button"
          onClick={() => {
            if (currentStep > 1) {
              setCurrentStep((prev) => prev - 1);
            } else {
              router.back();
            }
          }}
          className="w-[205px] p-3 bg-gray-500 opacity-50 text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
        >
          Назад
        </button>
        {currentStep < finalStep ? (
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              await handleNextStep();
            }}
            className="w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
          >
            Продолжить
          </button>
        ) : (
          <button
            type="submit"
            className="w-[205px] p-3 bg-[color:var(--button-secondary)]
            text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)]
            transition"
          >
            {mode === 'create' ? 'Создать' : 'Сохранить'}
          </button>
        )}
      </div>
    );
  };

  const onFormSubmit =
    currentStep === finalStep
      ? formMethods.handleSubmit(onSubmit)
      : (e: React.FormEvent) => e.preventDefault();

  const formTitle = mode === 'create' ? `Создание (${finalRole})` : `Редактирование (${finalRole})`;

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={onFormSubmit} className={'flex flex-col gap-4'}>
        <div className={'flex flex-row justify-between items-center'}>
          <h1 className="text-2xl font-extrabold leading-4">{formTitle}</h1>
          {/*Кнопка для изменения пароля (открывается только в режиме редактирования) */}
          {mode === 'edit' && userData?.uuid && (
            <button
              type="button"
              onClick={() => {
                setUserUuid(userData.uuid);
                setUserFullName(userData.fullName);
                openModal('changePasswordModal');
              }}
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Изменить пароль
            </button>
          )}
        </div>
        {renderForm()}
        {renderNavigationButtons()}
      </form>
    </FormProvider>
  );
};

export default ClientsAdminPage;
