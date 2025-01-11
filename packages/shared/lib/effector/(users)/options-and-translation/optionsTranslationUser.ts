import { Gender, UserRole } from '@prisma/client';

export const genderOptions = [
  { label: 'Мужской', value: 'Male' as Gender },
  { label: 'Женский', value: 'Female' as Gender },
];

export const roleTranslations: Record<UserRole, string> = {
  Client: 'Клиент',
  ClientCorp: 'Корпоративный клиент',
  Driver: 'Водитель',
  Operator: 'Оператор',
  Admin: 'Администратор',
  None: 'Нет роли',
};
