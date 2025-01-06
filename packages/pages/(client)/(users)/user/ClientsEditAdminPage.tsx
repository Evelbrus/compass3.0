'use client';

import React, { JSX } from 'react';
import { User, UserRole } from '@prisma/client';
import {
  AdminEditForm,
  ClientCorpEditForm,
  ClientEditForm,
  DriverEditForm,
  OperatorEditForm,
} from '@pages/(client)/(users)/user/index';
import { EditUserData } from '@shared/prisma/interface/users/interface';

interface ClientsEditAdminPageProps {
  userData: User;
}

const ClientsEditAdminPage = ({ userData }: ClientsEditAdminPageProps): JSX.Element => {
  const role = userData.role;

  const handleSubmit = async (formData: EditUserData) => {
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
      console.log('User updated:', data);
    } catch (error) {
      console.error('Error updating user:', error);
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
