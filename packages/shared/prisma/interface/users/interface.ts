import { User, CompanyProfile, DriverProfile, DriverExperience, UserRole } from '@prisma/client';

export interface UserSession {
  uuid: string;
  email: string;
  role: UserRole;
  lastActive: Date | null;
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

export type EditUserData = Omit<User, 'createdAt' | 'updatedAt'> & {
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
