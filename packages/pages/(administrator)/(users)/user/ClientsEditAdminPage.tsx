'use client';

import React, { JSX } from 'react';
import { User, UserRole } from '@prisma/client';
import {
  AdminEditForm,
  ClientCorpEditForm,
  ClientEditForm,
  DriverEditForm,
  OperatorEditForm,
} from '@pages/(administrator)/(users)/user/index';
import { EditUserData } from '@shared/prisma/interface/users/interface';
import { showToast } from '@shared/components/toast/ToastManager';
import { useRouter } from 'next/navigation';

interface ClientsEditAdminPageProps {
  userData: User;
}

const ClientsEditAdminPage = ({ userData }: ClientsEditAdminPageProps): JSX.Element => {
  const role = userData.role;
  const router = useRouter();

  const handleSubmit = async (formData: EditUserData): Promise<string | null> => {
    try {
      const { email, password, ...updateData } = formData;
      const response = await fetch(`/api/users/${userData.uuid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      showToast.success('User updated successfully.');
      router.push(`/user/detail/${data.uuid}`);
      return data.uuid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast.error('Error updating user: ' + errorMessage);
      return null;
    }
  };

  switch (role) {
    case UserRole.Client:
      return <ClientEditForm userData={userData} onSubmit={handleSubmit} />;
    case UserRole.ClientCorp:
      return <ClientCorpEditForm userData={userData} onSubmit={handleSubmit} />;
    case UserRole.Driver:
      return <DriverEditForm userData={userData} onSubmit={handleSubmit} />;
    case UserRole.Operator:
      return <OperatorEditForm userData={userData} onSubmit={handleSubmit} />;
    case UserRole.Admin:
      return <AdminEditForm userData={userData} onSubmit={handleSubmit} />;
    default:
      return <AdminEditForm userData={userData} onSubmit={handleSubmit} />;
  }
};

export default ClientsEditAdminPage;
