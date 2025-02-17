import { Status, Vehicle } from '@prisma/client';

export type VehicleOverview = Vehicle & {
  drivers: {
    phone: string;
    fullName: string;
  }[];
};

export type DetailVehicleData = Omit<Vehicle, 'createdAt' | 'updatedAt'> & {
  vehicleDrivers: Array<{
    uuid: string;
    assignmentDate: Date;
    driver: {
      uuid: string;
      fullName: string;
      phone: string;
      status?: Status;
    };
  }>;
};
