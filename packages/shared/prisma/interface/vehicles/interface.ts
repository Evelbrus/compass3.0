import { Vehicle } from '@prisma/client';

export type VehicleOverview = Vehicle & {
  drivers: {
    phone: string;
    fullName: string;
  }[];
};

export type DetailVehicleData = Omit<Vehicle, 'createdAt' | 'updatedAt'> & {
  vehicleDrivers: Array<{
    uuid: string;
    driver: {
      uuid: string;
      user: {
        fullName: string;
        phone: string;
      };
    };
  }>;
};

export type CreateVehicleData = Omit<Vehicle, 'uuid' | 'createdAt' | 'updatedAt'> & {
  driverIds?: string[];
};

export type EditVehicleData = Omit<Vehicle, 'uuid' | 'createdAt' | 'updatedAt'> & {
  driverIds?: string[];
};
