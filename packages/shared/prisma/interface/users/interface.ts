import { User, CompanyProfile, DriverProfile } from '@prisma/client';

export type CreateUserData = Omit<
  User,
  'uuid' | 'driverProfileId' | 'companyProfileId' | 'createdAt' | 'updatedAt'
> & {
  companyProfile?: Omit<CompanyProfile, 'uuid' | 'createdAt' | 'updatedAt' | 'userId'>;
  driverProfile?: Omit<DriverProfile, 'uuid' | 'createdAt' | 'updatedAt' | 'userId'>;
  driverProfileId?: string | null;
  companyProfileId?: string | null;
};

export type EditUserData = Omit<User, 'createdAt' | 'updatedAt'> & {
  companyProfile?: Omit<CompanyProfile, 'uuid' | 'createdAt' | 'updatedAt' | 'userId'>;
  driverProfile?: Omit<DriverProfile, 'uuid' | 'createdAt' | 'updatedAt' | 'userId'>;
  driverProfileId?: string | null;
  companyProfileId?: string | null;
};
