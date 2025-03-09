// app/src/dto/drivers/driver.dto.ts
import { ServiceLevels, VehicleType } from '@prisma/client';

export interface GetDriversRequestDTO {
  page: number;
  per_page: number;
  serviceLevel?: ServiceLevels | null;
  vehicleType?: VehicleType | null;
  search?: string | null;
  assignedDriverId?: string | null;
}

export interface DriverVehicleDTO {
  vehicleType: VehicleType;
  serviceLevels: ServiceLevels;
  plateNumber: string;
}

export interface DriverResponseDTO {
  uuid: string;
  fullName: string;
  phone: string | null;
  profilePhotoPath: string | null;
  lastActive: Date | null;
  vehicleDriver: {
    vehicle: DriverVehicleDTO | null;
  } | null;
}
