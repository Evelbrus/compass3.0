import {
  Citizenship,
  IdentityDocument,
  ChangingDriver,
  Status,
  PartnerCompany,
} from '@prisma/client';

export const citizenshipOptions = [
  { label: 'Гражданство РФ', value: 'RU' as Citizenship },
  { label: 'Гражданство Кыргызстана', value: 'KG' as Citizenship },
];

export const identityDocumentOptions = [
  { label: 'Паспорт РФ', value: 'Russian' as IdentityDocument },
  { label: 'Паспорт Кыргызстана', value: 'Kyrgyzstan' as IdentityDocument },
];

export const changingDriverOptions = [
  { label: 'Дневная', value: 'Day' as ChangingDriver },
  { label: 'Ночная', value: 'Night' as ChangingDriver },
  { label: 'Дневная/Ночная', value: 'Both' as ChangingDriver },
];

export const partnerOptions = [
  { value: 'TRANSFER', label: 'Трансфер компас' as PartnerCompany },
  { value: 'YANDEX', label: 'Яндекс' as PartnerCompany },
  { value: 'UBER', label: 'Убер' as PartnerCompany },
  { value: 'NONE', label: 'Нет партнера' as PartnerCompany },
];
