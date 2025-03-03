import { User, CompanyProfile, DriverProfile, DriverExperience, UserRole } from '@prisma/client';

// Расширенный интерфейс UserSession
export interface UserSession {
  uuid: string;
  email: string;
  fullName: string;
  role: UserRole;
  lastActive: Date | null;
  phone: string;
  companyProfile?: {
    companyName: string;
    phone: string;
    logoImagePath?: string | null;
  } | null;
}

export type CreateUserData = Omit<
  User,
  'uuid' | 'driverProfileId' | 'companyProfileId' | 'createdAt' | 'updatedAt'
> & {
  companyProfile?: Omit<CompanyProfile, 'uuid' | 'createdAt' | 'updatedAt' | 'userId'>;
  driverProfile?: Omit<DriverProfile, 'uuid' | 'createdAt' | 'updatedAt' | 'userId'> & {
    driverExperience?: Omit<
      DriverExperience,
      'uuid' | 'createdAt' | 'updatedAt' | 'driverProfileId'
    >[];
  };
  driverProfileId?: string | null;
  companyProfileId?: string | null;
};