'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyProfile, DriverProfile, User, UserRole } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
import { v4 as uuidv4 } from 'uuid';
import { userFormData } from '@shared/prisma/interfaceForm/user/userFormData';

interface UseClientsAdminSubmitProps {
  mode: 'create' | 'edit';
  finalRole: UserRole;
  userData?:
    | (User & {
        companyProfile?: CompanyProfile | null;
        driverProfile?: DriverProfile | null;
      })
    | null;
}

export const useClientsAdminSubmit = ({
  mode,
  finalRole,
  userData,
}: UseClientsAdminSubmitProps) => {
  const router = useRouter();

  // Подготовка companyProfile
  const prepareCompanyProfile = (
    companyProfile: userFormData['companyProfile'],
    isCreate: boolean,
  ) => {
    const { logoImagePath, ...companyData } = companyProfile!;
    let finalLogoPath: string | null = null;

    if (logoImagePath instanceof File) {
      finalLogoPath = `/logo/${uuidv4()}-${logoImagePath.name}`;
    } else if (typeof logoImagePath === 'string') {
      finalLogoPath = logoImagePath;
    } else if (!isCreate) {
      finalLogoPath = userData?.companyProfile?.logoImagePath || null;
    }

    return {
      ...companyData,
      logoImagePath: finalLogoPath,
    };
  };

  // Подготовка driverProfile
  const prepareDriverProfile = (
    driverProfile: userFormData['driverProfile'],
    isCreate: boolean,
  ) => {
    const { passportImage, driverProfileImage, licenseImage, ...driverData } = driverProfile!;
    let passportPhotoPath: string | null = null;
    let profilePhotoPath: string | null = null;
    let licensePhotoPath: string | null = null;

    if (passportImage instanceof File) {
      passportPhotoPath = `/drivers/passport/${uuidv4()}-${passportImage.name}`;
    } else if (typeof driverProfile?.passportPhotoPath === 'string') {
      passportPhotoPath = driverProfile.passportPhotoPath;
    } else if (!isCreate) {
      passportPhotoPath = userData?.driverProfile?.passportPhotoPath || null;
    }

    if (driverProfileImage instanceof File) {
      profilePhotoPath = `/drivers/profile/${uuidv4()}-${driverProfileImage.name}`;
    } else if (typeof driverProfile?.profilePhotoPath === 'string') {
      profilePhotoPath = driverProfile.profilePhotoPath;
    } else if (!isCreate) {
      profilePhotoPath = userData?.driverProfile?.profilePhotoPath || null;
    }

    if (licenseImage instanceof File) {
      licensePhotoPath = `/drivers/license/${uuidv4()}-${licenseImage.name}`;
    } else if (typeof driverProfile?.licensePhotoPath === 'string') {
      licensePhotoPath = driverProfile.licensePhotoPath;
    } else if (!isCreate) {
      licensePhotoPath = userData?.driverProfile?.licensePhotoPath || null;
    }

    return {
      ...driverData,
      passportPhotoPath,
      profilePhotoPath,
      licensePhotoPath,
    };
  };

  // Основная функция отправки
  const handleSubmit = useCallback(
    async (data: userFormData): Promise<void> => {
      const fullName = `${data.lastName} ${data.firstName} ${data.middleName || ''}`.trim();
      const email = data.email?.toLowerCase() || '';

      // Определяем profilePhotoPath
      let profilePhotoPath: string | null = null;
      if (data.profilePhotoPath instanceof File) {
        profilePhotoPath = `/avatar/${uuidv4()}-${data.profilePhotoPath.name}`;
      } else if (typeof data.profilePhotoPath === 'string') {
        profilePhotoPath = data.profilePhotoPath;
      } else if (mode === 'edit') {
        profilePhotoPath = userData?.profilePhotoPath || null;
      }

      // Базовый payload
      const payload: any = {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        fullName,
        email,
        phone: data.phone,
        gender: data.gender,
        address: data.address,
        availability: data.availability,
        role: finalRole,
        profilePhotoPath,
      };

      // Добавляем UUID для PUT запроса
      if (mode === 'edit' && userData?.uuid) {
        payload.uuid = userData.uuid;
      }

      // Добавляем пароль
      if (mode === 'create') {
        payload.password = data.password;
      } else if (mode === 'edit' && data.password) {
        payload.password = data.password;
      }

      // Добавляем companyProfile
      if (data.companyProfile) {
        payload.companyProfile = prepareCompanyProfile(data.companyProfile, mode === 'create');
      }

      // Добавляем driverProfile для роли Driver
      if (finalRole === UserRole.Driver && data.driverProfile) {
        payload.driverProfile = prepareDriverProfile(data.driverProfile, mode === 'create');
      }

      // Добавляем partnerCompany
      if (data.partnerCompany) {
        payload.partnerCompany = data.partnerCompany;
      }

      try {
        const apiUrl = mode === 'create' ? '/api/users' : `/api/users/${userData?.uuid}`;
        const response = await fetch(apiUrl, {
          method: mode === 'create' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const responseData = await response.json();
        if (!response.ok) {
          throw new Error(
            `Не удалось ${mode === 'create' ? 'создать' : 'обновить'} пользователя: ${responseData.message || 'Ошибка сервера'}`,
          );
        }

        const userUuid = responseData.uuid;
        if (!userUuid) throw new Error('Сервер не вернул UUID пользователя');

        // Загрузка файлов
        const formData = new FormData();
        let hasFiles = false;

        if (data.profilePhotoPath instanceof File) {
          formData.append('profileImage', data.profilePhotoPath);
          formData.append('profilePhotoPath', profilePhotoPath!);
          hasFiles = true;
        }

        if (data.companyProfile?.logoImagePath instanceof File) {
          formData.append('logoImage', data.companyProfile.logoImagePath);
          formData.append('logoImagePath', payload.companyProfile.logoImagePath);
          hasFiles = true;
        }

        if (finalRole === UserRole.Driver && data.driverProfile) {
          if (data.driverProfile.passportImage instanceof File) {
            formData.append('passportImage', data.driverProfile.passportImage);
            formData.append('passportPhotoPath', payload.driverProfile.passportPhotoPath);
            hasFiles = true;
          }
          if (data.driverProfile.driverProfileImage instanceof File) {
            formData.append('driverProfileImage', data.driverProfile.driverProfileImage);
            formData.append('driverProfilePhotoPath', payload.driverProfile.profilePhotoPath);
            hasFiles = true;
          }
          if (data.driverProfile.licenseImage instanceof File) {
            formData.append('licenseImage', data.driverProfile.licenseImage);
            formData.append('licensePhotoPath', payload.driverProfile.licensePhotoPath);
            hasFiles = true;
          }
        }

        if (hasFiles) {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const uploadData = await uploadResponse.json();
          if (!uploadResponse.ok) {
            throw new Error(uploadData.message || 'Ошибка при загрузке файлов');
          }
        }

        showToast.success(`Пользователь успешно ${mode === 'create' ? 'создан' : 'обновлён'}!`);
        router.push(`/user/detail/${userUuid}`);
      } catch (error: any) {
        showToast.error(`Ошибка: ${error.message}`);
        console.error(`Ошибка при ${mode === 'create' ? 'создании' : 'обновлении'}:`, error);
      }
    },
    [mode, finalRole, userData, router],
  );

  return { handleSubmit };
};

export default useClientsAdminSubmit;
