'use client';

import React, { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@shared/components/toast/ToastManager';
import { UserRole } from '@prisma/client';
import {
  ClientCreateForm,
  ClientCorpCreateForm,
  DriverCreateForm,
  OperatorCreateForm,
  AdminCreateForm,
} from '@pages/(administrator)/(users)/user/index';
import { CreateUserData } from '@shared/prisma/interface/users/interface';

interface ClientsCreateAdminPageProps {
  role: UserRole;
}

const ClientsCreateAdminPage = ({ role }: ClientsCreateAdminPageProps): JSX.Element => {
  const router = useRouter();

  const handleSubmit = async (
    formData: Omit<CreateUserData, 'profilePhotoPath'>,
  ): Promise<string | null> => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Ошибка при создании пользователя: ${response.status} - ${errorData.message || 'Неизвестная ошибка'}`,
        );
      }

      const userData = await response.json();
      const userUuid = userData.uuid;

      showToast.success('Пользователь успешно создан!');
      console.log('Пользователь создан:', userData);
      router.push(`/user/detail/${userUuid}`);
      return userUuid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showToast.error(`Не удалось создать пользователя: ${errorMessage}`);
      console.error('Ошибка создания пользователя:', error);
      return null;
    }
  };

  switch (role) {
    case UserRole.Client:
      return <ClientCreateForm onSubmit={handleSubmit} />;
    case UserRole.ClientCorp:
      return <ClientCorpCreateForm onSubmit={handleSubmit} />;
    case UserRole.Driver:
      return <DriverCreateForm onSubmit={handleSubmit} />;
    case UserRole.Operator:
      return <OperatorCreateForm onSubmit={handleSubmit} />;
    case UserRole.Admin:
      return <AdminCreateForm onSubmit={handleSubmit} />;
    default:
      return <AdminCreateForm onSubmit={handleSubmit} />;
  }
};

export default ClientsCreateAdminPage;
