import { Citizenship, RateType, IdentityDocument, ChangingDriver, Status } from '@prisma/client';

export const driverTypeOptions = [
  { value: 'compassTransfer', label: 'Компасс трансфер' },
  { value: 'othercompany', label: 'Другая компания' },
];

export const citizenshipOptions = [
  { label: 'Гражданство РФ', value: 'RU' as Citizenship },
  { label: 'Гражданство Кыргызстана', value: 'KG' as Citizenship },
];

export const rateTypeOptions = [
  { label: 'Почасовая', value: 'Hourly' as RateType },
  { label: 'Фиксированная', value: 'Fixed' as RateType },
];

export const identityDocumentOptions = [
  { label: 'Паспорт РФ', value: 'Russian' as IdentityDocument },
  { label: 'Паспорт Кыргызстана', value: 'Kyrgyzstan' as IdentityDocument },
];

export const changingDriverOptions = [
  { label: 'Дневная', value: 'Day' as ChangingDriver },
  { label: 'Ночная', value: 'Night' as ChangingDriver },
  { label: 'Обо', value: 'Both' as ChangingDriver },
];

export const statusOptions = [
  { label: 'Свободен', value: 'Free' as Status },
  { label: 'Занят', value: 'Busy' as Status },
];
