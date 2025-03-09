// app/src/dto/vehicles/vehicle.dto.ts
import { ServiceLevels, VehicleType } from '@prisma/client';

export interface CreateVehicleDTO {
  vehicleType: VehicleType;
  brand: string;
  model: string;
  year?: Date | string;
  color: string;
  plateNumber: string;
  isAvailable: boolean;
  photoPath?: string;
  serviceLevels: ServiceLevels;
  ownership?: string;
  driverIds?: string[];
  vehicleDrivers?: { driver: { uuid: string } }[];
}

export interface UpdateVehicleDTO extends Partial<CreateVehicleDTO> {}

export interface UpdateVehicleAvailabilityDTO {
  uuid: string;
  isAvailable: boolean;
}

export interface PatchVehicleDTO {
  uuid: string;
  photoPath?: string;
}

export interface GetVehiclesRequestDTO {
  page: number;
  per_page: number;
  vehicleType?: VehicleType | null;
  serviceLevel?: ServiceLevels | null;
  color?: string | null;
  availability?: boolean | null;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface DriverInfo {
  userUuid: string;
  fullName: string;
  phone: string | null;
}

export interface VehicleResponseDTO {
  uuid: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  year: Date | null;
  color: string | null;
  plateNumber: string;
  isAvailable: boolean;
  photoPath: string | null;
  serviceLevels: ServiceLevels;
  createdAt: Date;
  updatedAt: Date;
  drivers: DriverInfo[];
}

export interface VehicleTypeCount {
  type: VehicleType;
  count: number;
}

export interface VehiclesListResponseDTO {
  status: string;
  message: string;
  data: {
    page: number;
    per_page: number;
    total: number;
    totalAllVehicles: number;
    vehicleTypeCounts: VehicleTypeCount[];
    vehicles: VehicleResponseDTO[];
  };
}
