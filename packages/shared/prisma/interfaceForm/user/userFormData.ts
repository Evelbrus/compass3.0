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
    licenseIssueDate?: string;
    profilePhotoPath?: string | File;
    passportPhotoPath?: string | File;
    licensePhotoPath?: string | File;
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
    // Можно добавить другие доп. поля драйвера здесь
    passportImage?: File; // Добавляем поле для загрузки изображения паспорта
    driverProfileImage?: File; // Добавляем поле для загрузки изображения профиля
    licenseImage?: File; // Добавляем поле для загрузки изображения лицензии
  };
  profilePhotoPath?: string | File;
  partnerCompany?: PartnerCompany;
  individualSalaryRate?: number;

  // Добавляем поля для работы с автомобилями
  assignedVehicleId?: string | null; // ID выбранного автомобиля
  createNewVehicle?: boolean; // Флаг создания нового автомобиля
  newVehicle?: {
    vehicleType: string;
    brand: string;
    model: string;
    year: string | number;
    color: string;
    plateNumber: string;
    serviceLevels: string;
    ownership: string;
    photoImage?: File; // Добавляем поле для загрузки изображения автомобиля
    photoPath?: string;
    isAvailable?: boolean;
  };
}