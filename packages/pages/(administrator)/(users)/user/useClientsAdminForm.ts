'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, UseFormReturn, FieldPath } from 'react-hook-form';
import { showToast } from '@shared/components/toast/ToastManager';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole, CompanyProfile, DriverProfile, DriverExperience } from '@prisma/client';

/**Интерфейсы для типизации */
export interface CompanyCard extends Omit<CompanyProfile, 'createdAt' | 'updatedAt'> {
  logoImagePath: string | null;
}

export interface UserCard
  extends Omit<User, 'password' | 'refreshTokens' | 'createdAt' | 'updatedAt'> {
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  profileImage?: File | null;
  companyProfile?: CompanyCard & { logoImage?: File | null };
  driverProfile?: DriverProfile & {
    passportImage?: File | null;
    driverProfileImage?: File | null;
    licenseImage?: File | null;
    driverExperience?: DriverExperience[];
  };
}

interface PayloadDriverProfile
  extends Omit<DriverProfile, 'passportPhotoPath' | 'profilePhotoPath' | 'licensePhotoPath'> {
  passportPhotoPath: string | null;
  profilePhotoPath: string | null;
  licensePhotoPath: string | null;
}

interface PayloadCompanyProfile extends Omit<CompanyProfile, 'createdAt' | 'updatedAt'> {
  logoImagePath: string | null;
}

interface PayloadUser
  extends Omit<UserCard, 'profileImage' | 'companyProfile' | 'confirmPassword' | 'driverProfile'> {
  profilePhotoPath: string | null;
  companyProfile?: PayloadCompanyProfile;
  driverProfile?: PayloadDriverProfile;
}

/**Пропсы для инициализации хука */
interface UseClientsAdminFormProps {
  mode: 'create' | 'edit';
  role?: UserRole;
  userData?: UserCard;
}

/**
 * Хук, инкапсулирующий логику:
 * - инициализация и валидация формы
 * - определение количества шагов
 * - предпросмотр изображений
 * - финальный сабмит (вызов API)
 */
export default function useClientsAdminForm({
  mode,
  role: propRole,
  userData,
}: UseClientsAdminFormProps) {
  const router = useRouter();

  /**Определяем финальную роль */
  const finalRole: UserRole = userData?.role || propRole || UserRole.Client;

  /**Маппинг количества шагов для каждой роли */
  const finalStepMapping: Record<Exclude<UserRole, 'None'>, number> = {
    Client: 1,
    ClientCorp: 2,
    Driver: 5,
    Operator: 2,
    Admin: 1,
  };

  //Если роль равна 'None', то используем значение по умолчанию (1), иначе — получаем значение из маппинга
  const finalStep =
    finalRole !== UserRole.None ? finalStepMapping[finalRole as Exclude<UserRole, 'None'>] : 1;

  /**Текущий шаг */
  const [currentStep, setCurrentStep] = useState<number>(1);

  /**Предпросмотры изображений */
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

  /**Инициализация react-hook-form */
  const formMethods: UseFormReturn<UserCard> = useForm<UserCard>({
    mode: 'onSubmit',
    defaultValues: userData || {},
  });
  const { watch, trigger } = formMethods;

  /**Обновление предпросмотра для файлов */
  const watchedPassportFile = watch('driverProfile.passportImage');
  useEffect(() => {
    if (watchedPassportFile && watchedPassportFile instanceof File) {
      const url = URL.createObjectURL(watchedPassportFile);
      setPassportPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watchedPassportFile]);

  const watchedDriverProfileFile = watch('driverProfile.driverProfileImage');
  useEffect(() => {
    if (watchedDriverProfileFile && watchedDriverProfileFile instanceof File) {
      const url = URL.createObjectURL(watchedDriverProfileFile);
      setDriverProfilePhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watchedDriverProfileFile]);

  const watchedLicenseFile = watch('driverProfile.licenseImage');
  useEffect(() => {
    if (watchedLicenseFile && watchedLicenseFile instanceof File) {
      const url = URL.createObjectURL(watchedLicenseFile);
      setLicensePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [watchedLicenseFile]);

  /**
   * Переход на следующий шаг с валидацией полей текущего шага
   */
  const handleNextStep = async () => {
    let fieldsToValidate: FieldPath<UserCard>[] = [];

    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'gender', 'address'];
      if (mode === 'create') {
        fieldsToValidate.push('password', 'confirmPassword');
      }
    }

    if (finalRole === UserRole.ClientCorp && currentStep === 2) {
      fieldsToValidate = ['companyProfile.companyName'];
    } else if (finalRole === UserRole.Operator && currentStep === 2) {
      fieldsToValidate = ['companyProfile.companyName'];
    } else if (finalRole === UserRole.Driver) {
      if (currentStep === 2) {
        fieldsToValidate = [
          'driverProfile.passportId',
          'driverProfile.passportIssueDate',
          'driverProfile.passportIssued',
          'driverProfile.birthDate',
          'driverProfile.permanentAddress',
          'driverProfile.typeDriver',
          'driverProfile.birthPlace',
          'driverProfile.changingDriver',
        ];
      } else if (currentStep === 3) {
        fieldsToValidate = ['driverProfile.yearsOfDriving'];
      }
    }

    const isValid = await trigger(fieldsToValidate as FieldPath<UserCard>[]);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      showToast.error('Пожалуйста, заполните все обязательные поля перед переходом.');
    }
  };

  /**
   * Финальный сабмит формы с вызовом API.
   * Здесь email приводится к нижнему регистру для согласованности.
   */
  const onSubmit = useCallback(
    async (data: UserCard): Promise<void> => {
      //Собираем fullName из введённых полей
      data.fullName = `${data.lastName} ${data.firstName}${
        data.middleName ? ' ' + data.middleName : ''
      }`.trim();

      //Приводим email к нижнему регистру
      data.email = data.email?.toLowerCase() || '';

      data.role = finalRole;

      const { profileImage, companyProfile, confirmPassword, driverProfile, ...rest } = data;
      let profileAvatarFilename: string | null = null;
      let logoFilename: string | null = null;
      let passportFilename: string | null = null;
      let driverProfileFilename: string | null = null;
      let licenseFilename: string | null = null;

      let profilePhotoPath: string | null = userData?.profilePhotoPath ?? null;

      const payload: PayloadUser = {
        ...rest,
        role: finalRole,
        profilePhotoPath,
      };

      if (companyProfile) {
        const { logoImage, ...companyData } = companyProfile;
        let logoImagePath = companyData.logoImagePath ?? null;
        if (logoImage && logoImage instanceof File) {
          logoFilename = `${uuidv4()}-${logoImage.name}`;
          logoImagePath = `/logo/${logoFilename}`;
        }
        payload.companyProfile = {
          ...companyData,
          logoImagePath,
        };
      }

      if (finalRole === UserRole.Driver && driverProfile) {
        const { passportImage, driverProfileImage, licenseImage, ...driverData } = driverProfile;
        const updatedDriverProfile: PayloadDriverProfile = {
          ...driverData,
          passportPhotoPath: passportImage
            ? `${uuidv4()}-${passportImage.name}`
            : driverData.passportPhotoPath || null,
          profilePhotoPath: driverProfileImage
            ? `${uuidv4()}-${driverProfileImage.name}`
            : driverData.profilePhotoPath || null,
          licensePhotoPath: licenseImage
            ? `${uuidv4()}-${licenseImage.name}`
            : driverData.licensePhotoPath || null,
        };

        if (passportImage) {
          passportFilename = updatedDriverProfile.passportPhotoPath;
        }
        if (driverProfileImage) {
          driverProfileFilename = updatedDriverProfile.profilePhotoPath;
        }
        if (licenseImage) {
          licenseFilename = updatedDriverProfile.licensePhotoPath;
        }
        payload.driverProfile = updatedDriverProfile;
      }

      const isCreateMode = mode === 'create';
      let userUuid = userData?.uuid;
      const action = isCreateMode ? 'created' : 'updated';

      if (profileImage) {
        profileAvatarFilename = `${uuidv4()}-${profileImage.name}`;
        profilePhotoPath = `/avatar/${profileAvatarFilename}`;
        payload.profilePhotoPath = profilePhotoPath;
      }

      try {
        if (isCreateMode) {
          userUuid = uuidv4();
        }
        const apiUrl = isCreateMode ? '/api/users' : `/api/users/${userData?.uuid}`;
        const response = await fetch(apiUrl, {
          method: isCreateMode ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, profilePhotoPath }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed ${action} user: ${response.status} - ${errorData.message || 'Unknown error'}`,
          );
        }

        const responseData = await response.json();
        userUuid = responseData.uuid;

        const formData = new FormData();
        if (userUuid && profileImage && profileAvatarFilename) {
          formData.append('profileImage', profileImage);
          formData.append('profilePhotoPath', `/avatar/${profileAvatarFilename}`);
        }
        if (companyProfile && companyProfile.logoImage && userUuid && logoFilename) {
          formData.append('logoImage', companyProfile.logoImage);
          formData.append('logoImagePath', `/logo/${logoFilename}`);
        }
        if (finalRole === UserRole.Driver && driverProfile && userUuid) {
          if (driverProfile.passportImage && passportFilename) {
            formData.append('passportImage', driverProfile.passportImage);
            formData.append('passportPhotoPath', `/drivers/passport/${passportFilename}`);
          }
          if (driverProfile.driverProfileImage && driverProfileFilename) {
            formData.append('driverProfileImage', driverProfile.driverProfileImage);
            formData.append('driverProfilePhotoPath', `/drivers/profile/${driverProfileFilename}`);
          }
          if (driverProfile.licenseImage && licenseFilename) {
            formData.append('licenseImage', driverProfile.licenseImage);
            formData.append('licensePhotoPath', `/drivers/license/${licenseFilename}`);
          }
        }

        if ([...formData.entries()].length > 0) {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (!uploadResponse.ok) {
            const uploadError = await uploadResponse.json();
            throw new Error(uploadError.message || 'Error uploading images');
          }
          const uploadResult = await uploadResponse.json();
          console.log('Upload result:', uploadResult);
        }

        showToast.success(`User ${action} successfully!`);
        router.push(`/user/detail/${userUuid}`);
      } catch (error: any) {
        showToast.error(`Failed ${action} user: ${error.message}`);
        console.error(`Error ${action} user:`, error);
      }
    },
    [mode, router, userData, finalRole, trigger],
  );

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
    onSubmit,
    finalRole,
    mode,
    userData,
  };
}
