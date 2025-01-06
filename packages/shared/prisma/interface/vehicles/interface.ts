import { ServiceLevel, Vehicle, VehicleDriver } from '@prisma/client';

export type CreateVehicleData = Omit<
  Vehicle,
  'uuid' | 'serviceLevelId' | 'createdAt' | 'updatedAt'
> & {
  driverId?: string;
  serviceLevelId: string;
};

interface VehicleDriverWithDetails extends Omit<VehicleDriver, 'createdAt' | 'updatedAt'> {
  driver: {
    uuid: string;
    user: {
      fullName: string;
      phone: string;
    };
  };
}

interface ServiceLevelWithDetails extends Omit<ServiceLevel, 'createdAt' | 'updatedAt'> {}

export interface DetailVehicleData extends Vehicle {
  vehicleDrivers: VehicleDriverWithDetails[];
  service_levels: {
    uuid: string;
    service: ServiceLevelWithDetails;
  }[];
}

//Тип данных для редактирования транспортного средства
export type EditVehicleData = Omit<
  Vehicle,
  'uuid' | 'driverId' | 'serviceLevelId' | 'createdAt' | 'updatedAt'
> & {
  driverIds?: string[];
  serviceLevelIds?: string[];
};
