// types/dto/user.dto.ts
import {
  CompanyProfile,
  DriverProfile,
  PartnerCompany,
  ServiceLevels,
  User,
  UserRole,
  VehicleType,
} from '@prisma/client';

// DTO для создания пользователя
export interface CreateUserDTO extends User {
  password: string;
  companyProfile?: CompanyProfile;
  driverProfile?: DriverProfile & {
    driverExperience?: Array<{
      companyName: string;
      position: string;
      from: string | Date;
      to: string | Date;
    }>;
    licenseIssueDate?: string;
  };
  assignedVehicleId?: string;
  createNewVehicle?: boolean;
  newVehicle?: {
    vehicleType: VehicleType;
    brand: string;
    model: string;
    year: string | number;
    color: string;
    plateNumber: string;
    serviceLevels: ServiceLevels;
    ownership: string;
    isAvailable?: boolean;
  };
  newVehiclePhotoPath?: string;
}

// DTO для запроса пользователей с фильтрацией
export interface GetUsersRequestDTO {
  page: number;
  per_page: number;
  role: UserRole | 'all' | null;
  roles: string[];
  availability: 'true' | 'false' | null;
  sort_by:
    | 'email'
    | 'fullName'
    | 'createdAt'
    | 'updatedAt'
    | 'role'
    | 'availability'
    | 'passportId';
  sort_order: 'asc' | 'desc';
  search: string | null;
}

// DTO для ответа при запросе пользователя
export interface UserResponseDTO {
  uuid: string;
  email: string;
  role: UserRole;
  phone: string | null;
  availability: boolean;
  fullName: string;
  driverProfile: {
    uuid: string;
    passportId: string | null;
    passportPhotoPath: string | null;
    yearsOfDriving: number | null;
  } | null;
  partnerCompany: PartnerCompany;
  createdAt: Date;
  updatedAt: Date;
}

// DTO для ответа со списком пользователей
export interface UsersListResponseDTO {
  status: string;
  message: string;
  data: {
    page: number;
    per_page: number;
    total: number;
    totalAllRoles: number;
    roleCounts: Array<{
      role: UserRole;
      _count: {
        role: number;
      };
    }>;
    users: UserResponseDTO[];
  };
}
