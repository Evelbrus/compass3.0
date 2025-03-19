import { prisma } from '@shared/prisma/prisma-client';
import { CompanyProfile, DriverExperience, DriverProfile, User, UserRole } from '@prisma/client';

export interface UserWithVehicle extends User {
  assignedVehicleId?: string | null;
  driverProfile?:
    | (DriverProfile & {
        driverExperience?: DriverExperience[];
      })
    | null;
}

export interface UserWithCompany extends User {
  companyProfile?: CompanyProfile | null;
}

export interface UserWithAll extends User {
  assignedVehicleId?: string | null;
  driverProfile?:
    | (DriverProfile & {
        driverExperience?: DriverExperience[];
      })
    | null;
  companyProfile?: CompanyProfile | null;
}

export const getUserRole = async (uuid: string): Promise<UserRole | null> => {
  const user = await prisma.user.findUnique({
    where: { uuid },
    select: { role: true },
  });
  return user ? user.role : null;
};

export const getClientData = async (uuid: string): Promise<User | null> => {
  // Используем findUnique без select для получения всех полей
  return await prisma.user.findUnique({
    where: { uuid },
  });
};

export const getClientCorpData = async (uuid: string): Promise<UserWithCompany | null> => {
  // Используем findUnique с включением связанных данных
  const user = await prisma.user.findUnique({
    where: { uuid },
    include: {
      companyProfile: true,
    },
  });

  return user as UserWithCompany | null;
};

export const getDriverData = async (uuid: string): Promise<UserWithVehicle | null> => {
  // Используем findUnique с включением связанных данных
  const driver = await prisma.user.findUnique({
    where: { uuid },
    include: {
      driverProfile: {
        include: {
          driverExperience: true,
        },
      },
    },
  });

  if (!driver) return null;

  // Затем получаем связанные автомобили для этого водителя
  const vehicleDriver = await prisma.vehicleDriver.findFirst({
    where: { driverId: uuid },
    include: { vehicle: true },
  });

  // Объединяем данные с приведением типа
  return {
    ...driver,
    assignedVehicleId: vehicleDriver?.vehicleId || null,
  } as UserWithVehicle;
};

export const getOperatorData = async (uuid: string): Promise<UserWithCompany | null> => {
  // Используем findUnique с включением связанных данных
  const user = await prisma.user.findUnique({
    where: { uuid },
    include: {
      companyProfile: true,
    },
  });

  return user as UserWithCompany | null;
};

export const getAdminData = async (uuid: string): Promise<UserWithAll | null> => {
  // Используем findUnique с включением всех связанных данных
  const user = await prisma.user.findUnique({
    where: { uuid },
    include: {
      driverProfile: {
        include: {
          driverExperience: true,
        },
      },
      companyProfile: true,
    },
  });

  if (!user) return null;

  // Затем получаем связанные автомобили для этого водителя, если он имеет роль Driver
  let assignedVehicleId: string | null = null;
  if (user.role === UserRole.Driver) {
    const vehicleDriver = await prisma.vehicleDriver.findFirst({
      where: { driverId: uuid },
      include: { vehicle: true },
    });
    assignedVehicleId = vehicleDriver?.vehicleId || null;
  }

  // Объединяем данные с приведением типа
  return {
    ...user,
    assignedVehicleId,
  } as UserWithAll;
};
