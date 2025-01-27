'use client';

import React, { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@shared/components/toast/ToastManager';
import { UserRole } from '@prisma/client';
import {
  AdminCreateForm,
  ClientCorpCreateForm,
  ClientCreateForm,
  DriverCreateForm,
  OperatorCreateForm,
} from '@pages/(administrator)/(users)/user/index';
import { CreateUserData } from '@shared/prisma/interface/users/interface';

interface ClientsCreateAdminPageProps {
  role: UserRole;
}

const ClientsCreateAdminPage = ({ role }: ClientsCreateAdminPageProps): JSX.Element => {
  const router = useRouter();

  console.log('role:', role);

  const handleSubmit = async (formData: CreateUserData) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      showToast.success('User created successfully!');
      console.log('User created:', data);

      //Перенаправление на страницу деталей пользователя
      router.push(`/user/detail/${data.uuid}`);
    } catch (error) {
      showToast.error('Failed to create user');
      console.error('Error creating user:', error);
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
