'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyProfile, DriverProfile, User, UserRole } from '@prisma/client';
import { showToast } from '@shared/components/toast/ToastManager';
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

interface FilePaths {
  profilePhotoPath?: string;
  logoImagePath?: string;
  passportPhotoPath?: string;
  driverProfilePhotoPath?: string;
  licensePhotoPath?: string;
  [key: string]: string | undefined;
}

export const useClientsAdminSubmit = ({
  mode,
  finalRole,
  userData,
}: UseClientsAdminSubmitProps) => {
  const router = useRouter();

  const handleSubmit = useCallback(
    async (data: userFormData): Promise<void> => {
      const fullName = `${data.lastName} ${data.firstName} ${data.middleName || ''}`.trim();
      const email = data.email?.toLowerCase() || '';

      // Базовый payload без путей
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
      };

      if (mode === 'edit' && userData?.uuid) {
        payload.uuid = userData.uuid;
      }
      if (mode === 'create') {
        payload.password = data.password;
      } else if (mode === 'edit' && data.password) {
        payload.password = data.password;
      }

      if (data.companyProfile) {
        payload.companyProfile = {
          companyName: data.companyProfile.companyName,
          address: data.companyProfile.address,
          phone: data.companyProfile.phone,
          email: data.companyProfile.email,
          website: data.companyProfile.website,
          companyPin: data.companyProfile.companyPin,
        };
      }

      if (finalRole === UserRole.Driver && data.driverProfile) {
        payload.driverProfile = {
          passportId: data.driverProfile.passportId,
          passportIssueDate: data.driverProfile.passportIssueDate,
          passportIssued: data.driverProfile.passportIssued,
          birthDate: data.driverProfile.birthDate,
          permanentAddress: data.driverProfile.permanentAddress,
          birthPlace: data.driverProfile.birthPlace,
          yearsOfDriving: data.driverProfile.yearsOfDriving,
          changingDriver: data.driverProfile.changingDriver,
          citizenship: data.driverProfile.citizenship,
          identityDocument: data.driverProfile.identityDocument,
          actualAddress: data.driverProfile.actualAddress,
          bankName: data.driverProfile.bankName,
          bankAccountNumber: data.driverProfile.bankAccountNumber,
          bankBic: data.driverProfile.bankBic,
          cardNumber: data.driverProfile.cardNumber,
        };
      }

      if (data.partnerCompany) {
        payload.partnerCompany = data.partnerCompany;
      }

      try {
        // 1. POST или PUT для создания/обновления пользователя
        const apiUrl =
          mode === 'create' ? '/api/admin/users' : `/api/admin/users/${userData?.uuid}`;
        const method = mode === 'create' ? 'POST' : 'PUT';
        const response = await fetch(apiUrl, {
          method,
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

        // 2. UPLOAD файлов — отправляем только файлы, сервер вернёт пути
        const uploadFormData = new FormData();
        let hasFiles = false;

        if (data.profilePhotoPath instanceof File) {
          uploadFormData.append('profileImage', data.profilePhotoPath);
          hasFiles = true;
        }
        if (data.companyProfile?.logoImagePath instanceof File) {
          uploadFormData.append('logoImage', data.companyProfile.logoImagePath);
          hasFiles = true;
        }
        if (finalRole === UserRole.Driver && data.driverProfile) {
          if (data.driverProfile.passportPhotoPath instanceof File) {
            uploadFormData.append('passportImage', data.driverProfile.passportPhotoPath);
            hasFiles = true;
          }
          if (data.driverProfile.profilePhotoPath instanceof File) {
            uploadFormData.append('driverProfileImage', data.driverProfile.profilePhotoPath);
            hasFiles = true;
          }
          if (data.driverProfile.licensePhotoPath instanceof File) {
            uploadFormData.append('licenseImage', data.driverProfile.licensePhotoPath);
            hasFiles = true;
          }
        }

        let filePaths: FilePaths = {};
        if (hasFiles) {
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: uploadFormData,
          });

          const uploadData = await uploadResponse.json();
          if (!uploadResponse.ok) {
            throw new Error(uploadData.message || 'Ошибка при загрузке файлов');
          }

          filePaths = uploadData.filePaths; // Получаем сгенерированные пути
        }

        // 3. PATCH для записи путей в базу
        if (hasFiles) {
          const patchPayload: any = { uuid: userUuid };
          if (filePaths.profilePhotoPath) {
            patchPayload.profilePhotoPath = filePaths.profilePhotoPath;
          }
          if (filePaths.logoImagePath) {
            patchPayload.companyProfile = { logoImagePath: filePaths.logoImagePath };
          }
          if (
            filePaths.passportPhotoPath ||
            filePaths.driverProfilePhotoPath ||
            filePaths.licensePhotoPath
          ) {
            patchPayload.driverProfile = {
              passportPhotoPath: filePaths.passportPhotoPath,
              profilePhotoPath: filePaths.driverProfilePhotoPath,
              licensePhotoPath: filePaths.licensePhotoPath,
            };
          }

          const patchResponse = await fetch(`/api/admin/users/${userUuid}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patchPayload),
          });

          const patchData = await patchResponse.json();
          if (!patchResponse.ok) {
            throw new Error(patchData.message || 'Ошибка при обновлении путей');
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