export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  maxLength: number;
  formatPattern: number[];
}

export const countryData: Country[] = [
  {
    code: 'kg-KG',
    name: 'Кыргызстан',
    dialCode: '+996',
    flag: '/images/phone/free-icon-kyrgyzstan-206700.png',
    maxLength: 9,
    formatPattern: [3, 3, 3],
  },
  {
    code: 'ru-RU',
    name: 'Россия',
    dialCode: '+7',
    flag: '/images/phone/free-icon-russia-555451.png',
    maxLength: 10,
    formatPattern: [3, 3, 2, 2],
  },
];
