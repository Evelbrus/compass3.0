import {
  ChangingDriver,
  Citizenship,
  Gender,
  IdentityDocument,
  PartnerCompany,
} from '@prisma/client';

/** Интерфейс формы (минимально необходимый для типизации) */
export interface userFormData {
  uuid?: string;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phone: string;
  gender?: Gender;
  address?: string;
  password?: string;
  confirmPassword?: string;
  availability: boolean;
  companyProfile?: {
    companyName: string;
    address?: string;
    companyPin?: string;
    email?: string;
    phone?: string;
    website?: string;
    logoImagePath?: string | File;
  };
  driverProfile?: {
    citizenship: Citizenship;
    identityDocument: IdentityDocument;
    changingDriver?: ChangingDriver;
    actualAddress?: string;
    passportId: string;
    passportIssueDate: string;
    passportIssued: string;
    birthDate: string;
    permanentAddress: string;
    birthPlace: string;
    yearsOfDriving?: number;
    profilePhotoPath?: string;
    passportPhotoPath?: string;
    licensePhotoPath?: string;
    driverExperience?: Array<{
      uuid: string;
      companyName: string;
      position: string;
      from: Date | string;
      to: Date | string;
      driverProfileId: string;
      id?: string;
    }>;
    bankName: string;
    bankAccountNumber: number;
    bankBic: string;
    cardNumber: number;
  };
  profilePhotoPath?: string | File;
  partnerCompany?: PartnerCompany;
  individualSalaryRate?: number;
}
