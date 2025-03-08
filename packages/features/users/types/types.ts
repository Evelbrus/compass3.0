import { CompanyProfile, DriverExperience, DriverProfile, User } from '@prisma/client';

export type UserCard = Pick<
  User,
  'uuid' | 'email' | 'role' | 'fullName' | 'phone' | 'gender' | 'address' |
  'profilePhotoPath' | 'availability' | 'lastActive' | 'isBlocked' |
  'driverStatus' | 'partnerCompany' | 'individualSalaryRate' | 'individualCurrency'
> & {
  createdAt: Date;
  updatedAt: Date;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  companyProfile?: (CompanyProfile & { logoImage?: File | null }) | null;
  driverProfile?: (DriverProfile & {
    passportImage?: File | null;
    driverProfileImage?: File | null;
    licenseImage?: File | null;
    driverExperience?: DriverExperience[];
  }) | null;
};

interface PayloadCompanyProfile extends Omit<CompanyProfile, 'createdAt' | 'updatedAt'> {
  logoImagePath: string | null;
}

export interface PayloadDriverProfile
  extends Omit<DriverProfile, 'passportPhotoPath' | 'profilePhotoPath' | 'licensePhotoPath'> {
  passportPhotoPath: string | null;
  profilePhotoPath: string | null;
  licensePhotoPath: string | null;
}

export interface PayloadUser
  extends Omit<UserCard, 'profileImage' | 'companyProfile' | 'confirmPassword' | 'driverProfile'> {
  profilePhotoPath: string | null;
  companyProfile?: PayloadCompanyProfile;
  driverProfile?: PayloadDriverProfile;
}
