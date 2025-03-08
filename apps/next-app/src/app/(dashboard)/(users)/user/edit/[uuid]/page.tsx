import React, { JSX } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import CreateUserAdminPage from '@pages/(administrator)/(users)/user/CreateUserAdminPage';
import Loading from '@entities/loading/loading';
import { CompanyProfile, DriverExperience, DriverProfile, User, UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';
import convertPrismaData from '@shared/prisma/utils/converterBigIntToString';
import {
  getAdminData,
  getClientCorpData,
  getClientData,
  getDriverData,
  getOperatorData,
  getUserRole,
} from './userQueries';

interface PageProps {
  params: Promise<{ uuid: string }>;
}

export const revalidate = 60;

const Page = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { uuid } = await params;
  const { role, refreshToken } = await getLayoutData();

  if (!refreshToken) {
    redirect(publicRoutes.LOGIN);
  }

  if (role !== UserRole.Admin && role !== UserRole.Operator) {
    return <Loading />;
  }

  try {
    const userRole = await getUserRole(uuid);

    if (!userRole) {
      return <Loading />;
    }

    let userData:
      | (User & {
          companyProfile?: CompanyProfile | null;
          driverProfile?: (DriverProfile & { driverExperience?: DriverExperience | null }) | null;
        })
      | null;

    switch (userRole) {
      case UserRole.Client:
        userData = await getClientData(uuid);
        break;
      case UserRole.ClientCorp:
        userData = await getClientCorpData(uuid);
        break;
      case UserRole.Driver:
        userData = await getDriverData(uuid);
        break;
      case UserRole.Operator:
        userData = await getOperatorData(uuid);
        break;
      case UserRole.Admin:
        userData = await getAdminData(uuid);
        break;
      default:
        return <Loading />;
    }

    if (!userData) {
      return <Loading />;
    }

    const parseFullName = (
      fullName: string | null,
    ): { firstName: string; lastName: string; middleName: string } => {
      const parts = fullName ? fullName.split(' ') : ['', '', ''];
      return {
        lastName: parts[0] || '',
        firstName: parts[1] || '',
        middleName: parts.length > 2 ? parts.slice(2).join(' ') : '',
      };
    };

    const convertedUserData = convertPrismaData({
      ...userData,
      ...parseFullName(userData.fullName),
    });

    return <CreateUserAdminPage role={role} mode={'edit'} userData={convertedUserData} />;
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error);
    return <Loading />;
  }
};

export default Page;
