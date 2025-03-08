import { prisma } from '@shared/prisma/prisma-client';
import { User, UserRole } from '@prisma/client';

export const getUserRole = async (uuid: string): Promise<UserRole | null> => {
  const user = await prisma.user.findUnique({
    where: { uuid },
    select: { role: true },
  });
  return user ? user.role : null;
};

export const getClientData = async (uuid: string) => {
  return (await prisma.user.findUnique({
    where: { uuid },
    select: {
      uuid: true,
      email: true,
      role: true,
      fullName: true,
      phone: true,
      gender: true,
      address: true,
      profilePhotoPath: true,
      availability: true,
      lastActive: true,
      isBlocked: true,
      createdAt: true,
      updatedAt: true,
    },
  })) as User | null;
};

export const getClientCorpData = async (uuid: string) => {
  return (await prisma.user.findUnique({
    where: { uuid },
    select: {
      uuid: true,
      email: true,
      role: true,
      fullName: true,
      phone: true,
      gender: true,
      address: true,
      profilePhotoPath: true,
      availability: true,
      lastActive: true,
      isBlocked: true,
      createdAt: true,
      updatedAt: true,
      companyProfile: true,
    },
  })) as User | null;
};

export const getDriverData = async (uuid: string) => {
  return (await prisma.user.findUnique({
    where: { uuid },
    select: {
      uuid: true,
      email: true,
      role: true,
      fullName: true,
      phone: true,
      gender: true,
      address: true,
      profilePhotoPath: true,
      availability: true,
      lastActive: true,
      isBlocked: true,
      createdAt: true,
      updatedAt: true,
      driverStatus: true,
      partnerCompany: true,
      individualSalaryRate: true,
      individualCurrency: true,
      driverProfile: {
        include: {
          driverExperience: true,
        },
      },
    },
  })) as User | null;
};

export const getOperatorData = async (uuid: string) => {
  return (await prisma.user.findUnique({
    where: { uuid },
    select: {
      uuid: true,
      email: true,
      role: true,
      fullName: true,
      phone: true,
      gender: true,
      address: true,
      profilePhotoPath: true,
      availability: true,
      lastActive: true,
      isBlocked: true,
      createdAt: true,
      updatedAt: true,
      companyProfile: true,
    },
  })) as User | null;
};

export const getAdminData = async (uuid: string) => {
  return (await prisma.user.findUnique({
    where: { uuid },
    select: {
      uuid: true,
      email: true,
      role: true,
      fullName: true,
      phone: true,
      gender: true,
      address: true,
      profilePhotoPath: true,
      availability: true,
      lastActive: true,
      isBlocked: true,
      createdAt: true,
      updatedAt: true,
      driverStatus: true,
      partnerCompany: true,
      individualSalaryRate: true,
      individualCurrency: true,
      driverProfile: {
        include: {
          driverExperience: true,
        },
      },
      companyProfile: true,
    },
  })) as User | null;
};
