// src/dto/users/user-detail.dto.ts
import { CompanyProfile, DriverProfile, User, UserRole, PartnerCompany } from '@prisma/client';

// DTO для запроса пользователя по UUID
export interface GetUserRequestDTO {
  uuid: string;
}

// DTO для ответа с данными пользователя
export interface UserDetailResponseDTO extends User {
  driverProfile?: {
    uuid: string;
    passportId: string | null;
    passportPhotoPath: string | null;
    yearsOfDriving: number | null;
    driverExperience?: Array<{
      companyName: string;
      position: string;
      from: Date;
      to: Date;
    }>;
  };
  companyProfile?: {
    uuid: string;
    companyName: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    companyPin: string | null;
    logoImagePath: string | null;
  };
}

// DTO для обновления пользователя (PUT)
export interface UpdateUserDTO extends User {
  companyProfile?: CompanyProfile;
  driverProfile?: DriverProfile & {
    driverExperience?: Array<{
      companyName: string;
      position: string;
      from: string | Date;
      to: string | Date;
    }>;
  };
}

// DTO для частичного обновления пользователя (PATCH)
export interface PatchUserDTO {
  uuid: string;
  role?: UserRole;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
  profilePhotoPath?: string;
  partnerCompany?: PartnerCompany;
  individualSalaryRate?: number;
  defaultSalaryId?: string;
  availability?: boolean;
  [key: string]: any;
}
