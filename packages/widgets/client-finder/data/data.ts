import { Option } from '@shared/lib/effector';

export const clientOptions: Option<string>[] = [
  { value: '', label: 'Не выбрано' },
  { value: '1', label: 'Иван Иванов' },
  { value: '2', label: 'Мария Петрова' },
  { value: '3', label: 'Сергей Смирнов' },
];

export const clientPhoneNumbers: { [key: string]: string } = {
  '1': '+7 (123) 456-7890',
  '2': '+7 (234) 567-8901',
  '3': '+7 (345) 678-9012',
};
