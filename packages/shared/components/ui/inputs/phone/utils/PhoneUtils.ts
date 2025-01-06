import { countryData } from '@shared/components/ui/inputs/phone';

export const validateAndFormatPhone = (phone: string): { isValid: boolean; formatted: string } => {
  const cleanedPhone = phone.replace(/\D/g, '');

  const country = countryData.find((c) => cleanedPhone.startsWith(c.dialCode.replace('+', '')));
  if (!country) {
    return { isValid: false, formatted: phone };
  }

  const localPhone = cleanedPhone.slice(country.dialCode.length - 1);

  if (localPhone.length !== country.maxLength) {
    return { isValid: false, formatted: phone };
  }

  let formattedPhone = '';
  let currentIndex = 0;

  for (const chunk of country.formatPattern) {
    if (currentIndex + chunk <= localPhone.length) {
      formattedPhone += localPhone.slice(currentIndex, currentIndex + chunk) + '-';
      currentIndex += chunk;
    }
  }

  formattedPhone = formattedPhone.slice(0, -1);

  return { isValid: true, formatted: `${country.dialCode} ${formattedPhone}` };
};
