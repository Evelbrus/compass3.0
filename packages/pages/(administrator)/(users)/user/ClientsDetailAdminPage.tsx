'use client';

import React, { JSX } from 'react';
import { User, UserRole } from '@prisma/client';
import AdminDetailView from '@pages/(administrator)/(users)/user/admin/AdminDetailView';
import ClientCorpDetailView from '@pages/(administrator)/(users)/user/client-corp/ClientCorpDetailView';
import DriverDetailView from '@pages/(administrator)/(users)/user/driver/DriverDetailView';
import OperatorDetailView from '@pages/(administrator)/(users)/user/operator/OperatorDetailView';
import ClientDetailView from '@pages/(administrator)/(users)/user/client/ClientDetailView';

interface ClientsDetailAdminPageProps {
  userData: User;
}

const ClientsDetailAdminPage = ({ userData }: ClientsDetailAdminPageProps): JSX.Element => {
  const role = userData.role;

  switch (role) {
    case UserRole.Client:
      return <ClientDetailView userData={userData} />;
    case UserRole.ClientCorp:
      return <ClientCorpDetailView userData={userData} />;
    case UserRole.Driver:
      return <DriverDetailView userData={userData} />;
    case UserRole.Operator:
      return <OperatorDetailView userData={userData} />;
    case UserRole.Admin:
      return <AdminDetailView userData={userData} />;
    default:
      return <AdminDetailView userData={userData} />;
  }
};

export default ClientsDetailAdminPage;
