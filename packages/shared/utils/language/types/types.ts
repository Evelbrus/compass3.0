export type LanguageCode = 'ru' | 'en' | 'ky' | 'zh';

export interface Language {
  code: LanguageCode;
  apiCode: string;
  label: string;
}

export const languages: Language[] = [
  { code: 'ru', apiCode: 'ru-RU', label: 'Русский' },
  { code: 'en', apiCode: 'en-US', label: 'Английский' },
  { code: 'ky', apiCode: 'ky-KG', label: 'Кыргызский' },
];

export function mapLanguageCode(lang: LanguageCode) {
  const language = languages.find((l) => l.code === lang);
  return language ? language.apiCode : 'ru-RU';
}

export function getLanguageCode(apiCode: string) {
  const language = languages.find((l) => l.apiCode === apiCode);
  return language ? language.label : apiCode;
}
