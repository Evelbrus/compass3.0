import { Gender, UserRole } from '@prisma/client';

export const genderOptions = [
  { label: 'Мужской', value: 'Male' as Gender },
  { label: 'Женский', value: 'Female' as Gender },
];

export const roleOptions: { label: string; value: UserRole }[] = [
  { label: 'Client', value: UserRole.Client },
  { label: 'ClientCorp', value: UserRole.ClientCorp },
  { label: 'Driver', value: UserRole.Driver },
  { label: 'Operator', value: UserRole.Operator },
  { label: 'Admin', value: UserRole.Admin },
];
