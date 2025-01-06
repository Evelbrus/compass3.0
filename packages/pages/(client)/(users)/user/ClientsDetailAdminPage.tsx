'use client';

import React, { JSX } from 'react';
import { User, UserRole } from '@prisma/client';
import AdminDetailView from '@pages/(client)/(users)/user/admin/AdminDetailView';
import ClientCorpDetailView from '@pages/(client)/(users)/user/client-corp/ClientCorpDetailView';
import DriverDetailView from '@pages/(client)/(users)/user/driver/DriverDetailView';
import OperatorDetailView from '@pages/(client)/(users)/user/operator/OperatorDetailView';
import ClientDetailView from '@pages/(client)/(users)/user/client/ClientDetailView';

interface ClientsDetailAdminPageProps {
  userData: User;
}

const ClientsDetailAdminPage = ({ userData }: ClientsDetailAdminPageProps): JSX.Element => {
  const role = userData.role;

  //Рендер компонента в зависимости от роли пользователя
  switch (role) {
    case 'Client':
      return <ClientDetailView userData={userData} />;
    case 'ClientCorp':
      return <ClientCorpDetailView userData={userData} />;
    case 'Driver':
      return <DriverDetailView userData={userData} />;
    case 'Operator':
      return <OperatorDetailView userData={userData} />;
    case 'Admin':
      return <AdminDetailView userData={userData} />;
    default:
      return <AdminDetailView userData={userData} />;
  }
};

export default ClientsDetailAdminPage;
