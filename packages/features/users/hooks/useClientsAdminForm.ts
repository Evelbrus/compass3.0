'use client';

import { useState, useEffect } from 'react';
import { useForm, FieldPath } from 'react-hook-form';
import { showToast } from '@shared/components/toast/ToastManager';
import { CompanyProfile, DriverExperience, DriverProfile, User, UserRole } from '@prisma/client';
import { userFormData } from '@shared/prisma/interfaceForm/user/userFormData';

/** Пропсы для инициализации хука */
interface UseClientsAdminFormProps {
  mode: 'create' | 'edit';
  role?: UserRole;
  userData?:
    | (User & {
        companyProfile?: CompanyProfile | null;
        driverProfile?: (DriverProfile & { driverExperience?: DriverExperience | null }) | null;
      })
    | null;
}

/**
 * Хук, инкапсулирующий логику:
 * - инициализация и валидация формы
 * - определение количества шагов
 * - предпросмотр изображений
 */
export default function useClientsAdminForm({
  mode,
  role: propRole,
  userData,
}: UseClientsAdminFormProps) {
  /** Определяем финальную роль */
  const finalRole: UserRole = userData?.role || propRole || UserRole.Client;

  /** Маппинг количества шагов для каждой роли */
  const finalStepMapping: Record<Exclude<UserRole, 'None'>, number> = {
    Client: 1,
    ClientCorp: 2,
    Driver: 5,
    Operator: 2,
    Admin: 1,
  };

  const finalStep =
    finalRole !== UserRole.None ? finalStepMapping[finalRole as Exclude<UserRole, 'None'>] : 1;

  /** Текущий шаг */
  const [currentStep, setCurrentStep] = useState<number>(1);

  /** Предпросмотры изображений */
  const [previewImage, setPreviewImage] = useState<string | null>(
    userData?.profilePhotoPath
      ? `/api/images/${encodeURIComponent(userData.profilePhotoPath.split('/').pop()!)}?type=avatar`
      : null,
  );

  const [previewLogo, setPreviewLogo] = useState<string | null>(
    userData?.companyProfile?.logoImagePath
      ? `/api/images/${encodeURIComponent(
          userData.companyProfile.logoImagePath.split('/').pop()!,
        )}?type=logo`
      : null,
  );

  const [driverProfilePhotoPreview, setDriverProfilePhotoPreview] = useState<string | null>(
    userData?.driverProfile?.profilePhotoPath
      ? `/api/images/${encodeURIComponent(
          userData.driverProfile.profilePhotoPath.split('/').pop()!,
        )}?type=drivers/profile`
      : null,
  );

  const [passportPreview, setPassportPreview] = useState<string | null>(
    userData?.driverProfile?.passportPhotoPath
      ? `/api/images/${encodeURIComponent(
          userData.driverProfile.passportPhotoPath.split('/').pop()!,
        )}?type=drivers/passport`
      : null,
  );

  const [licensePreview, setLicensePreview] = useState<string | null>(
    userData?.driverProfile?.licensePhotoPath
      ? `/api/images/${encodeURIComponent(
          userData.driverProfile.licensePhotoPath.split('/').pop()!,
        )}?type=drivers/license`
      : null,
  );

  /** Инициализация react-hook-form в вашем стиле */
  const formMethods = useForm<userFormData>({
    mode: 'onSubmit',
    defaultValues: (userData || {}) as userFormData,
  });
  const { watch, trigger } = formMethods;

  /** Обновление предпросмотра для файлов */
  const watchedProfilePhotoFile = watch('profilePhotoPath') as File | undefined;
  useEffect(() => {
    if (watchedProfilePhotoFile && watchedProfilePhotoFile instanceof File) {
      try {
        const url = URL.createObjectURL(watchedProfilePhotoFile);
        setPreviewImage(url);
        return () => URL.revokeObjectURL(url);
      } catch (error) {
        showToast.error('Ошибка при загрузке аватара.');
      }
    }
  }, [watchedProfilePhotoFile]);

  const watchedLogoFile = watch('companyProfile.logoImagePath') as File | undefined;
  useEffect(() => {
    if (watchedLogoFile && watchedLogoFile instanceof File) {
      try {
        const url = URL.createObjectURL(watchedLogoFile);
        setPreviewLogo(url);
        return () => URL.revokeObjectURL(url);
      } catch (error) {
        showToast.error('Ошибка при загрузке логотипа.');
      }
    }
  }, [watchedLogoFile]);

  const watchedPassportFile = watch('driverProfile.passportImage') as File | undefined;
  useEffect(() => {
    if (watchedPassportFile && watchedPassportFile instanceof File) {
      try {
        const url = URL.createObjectURL(watchedPassportFile);
        setPassportPreview(url);
        return () => URL.revokeObjectURL(url);
      } catch (error) {
        showToast.error('Ошибка при загрузке изображения паспорта.');
      }
    }
  }, [watchedPassportFile]);

  const watchedDriverProfileFile = watch('driverProfile.driverProfileImage') as File | undefined;
  useEffect(() => {
    if (watchedDriverProfileFile && watchedDriverProfileFile instanceof File) {
      try {
        const url = URL.createObjectURL(watchedDriverProfileFile);
        setDriverProfilePhotoPreview(url);
        return () => URL.revokeObjectURL(url);
      } catch (error) {
        showToast.error('Ошибка при загрузке фото профиля водителя.');
      }
    }
  }, [watchedDriverProfileFile]);

  const watchedLicenseFile = watch('driverProfile.licenseImage') as File | undefined;
  useEffect(() => {
    if (watchedLicenseFile && watchedLicenseFile instanceof File) {
      try {
        const url = URL.createObjectURL(watchedLicenseFile);
        setLicensePreview(url);
        return () => URL.revokeObjectURL(url);
      } catch (error) {
        showToast.error('Ошибка при загрузке изображения лицензии.');
      }
    }
  }, [watchedLicenseFile]);

  /**
   * Единая функция для получения полей, которые нужно валидировать
   */
  const getFieldsToValidate = (
    currentStepNum: number,
    targetStepNum: number,
  ): FieldPath<userFormData>[] => {
    if (targetStepNum < currentStepNum) return [];

    let fieldsToValidate: FieldPath<userFormData>[] = [];

    if (currentStepNum === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'gender', 'address'];
      if (mode === 'create') {
        fieldsToValidate.push('password', 'confirmPassword');
      }
    }

    if (currentStepNum === 2) {
      if (finalRole === UserRole.ClientCorp) {
        fieldsToValidate = ['companyProfile.companyName', 'companyProfile.phone'];
      } else if (finalRole === UserRole.Operator) {
        fieldsToValidate = ['companyProfile.companyName'];
      } else if (finalRole === UserRole.Driver) {
        fieldsToValidate = [
          'driverProfile.passportId',
          'driverProfile.passportIssueDate',
          'driverProfile.passportIssued',
          'driverProfile.birthDate',
          'driverProfile.permanentAddress',
          'driverProfile.birthPlace',
          'driverProfile.changingDriver',
          'partnerCompany',
        ];
      }
    } else if (currentStepNum === 3 && finalRole === UserRole.Driver) {
      fieldsToValidate = ['driverProfile.yearsOfDriving'];
    } else if (currentStepNum === 4 && finalRole === UserRole.Driver) {
      fieldsToValidate = ['driverProfile.licenseImage'];
    } else if (currentStepNum === 5 && finalRole === UserRole.Driver) {
      fieldsToValidate = ['driverProfile.driverProfileImage'];
    }

    return fieldsToValidate;
  };

  /**
   * Функция для получения всех полей для валидации
   */
  const getAllFieldsToValidate = (): FieldPath<userFormData>[] => {
    let allFields: FieldPath<userFormData>[] = [];
    for (let step = 1; step <= finalStep; step++) {
      const fieldsToValidate = getFieldsToValidate(step, step + 1);
      allFields.push(...fieldsToValidate);
    }
    return allFields;
  };

  /**
   * Кастомная валидация формы перед отправкой
   */
  const customValidateAndSubmit = async (onSuccess: (data: userFormData) => void) => {
    const allFields = getAllFieldsToValidate();
    const isValid = await trigger(allFields);

    if (isValid) {
      const userFormData = formMethods.getValues();
      onSuccess(userFormData);
    } else {
      showToast.error('Пожалуйста, заполните все обязательные поля.');
    }
  };

  /**
   * Переход на следующий шаг с валидацией
   */
  const handleNextStep = async () => {
    const isValid = await trigger(getFieldsToValidate(currentStep, currentStep + 1));
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      showToast.error('Пожалуйста, заполните все обязательные поля перед переходом.');
    }
  };

  /**
   * Обработчик изменения вкладки с валидацией
   */
  const handleTabChange = async (tabId: string) => {
    const targetTab = parseInt(tabId);
    if (targetTab < currentStep) {
      setCurrentStep(targetTab);
      return;
    }

    const isValid = await trigger(getFieldsToValidate(currentStep, targetTab));
    if (isValid) {
      setCurrentStep(targetTab);
    } else {
      showToast.error('Пожалуйста, заполните все обязательные поля перед переходом.');
    }
  };

  return {
    formMethods,
    currentStep,
    setCurrentStep,
    finalStep,
    previewImage,
    setPreviewImage,
    previewLogo,
    setPreviewLogo,
    driverProfilePhotoPreview,
    setDriverProfilePhotoPreview,
    passportPreview,
    setPassportPreview,
    licensePreview,
    setLicensePreview,
    handleNextStep,
    handleTabChange,
    customValidateAndSubmit,
    finalRole,
    mode,
    userData,
  };
}
