import { countryData } from '@shared/components/ui/inputs/phone';

const validatePhoneNumber = (value: string): true | string => {
  if (!value) return 'Номер телефона обязателен';
  const matchedCountry = countryData.find((country) => value.startsWith(country.dialCode));
  if (!matchedCountry) {
    return 'Неизвестный код страны';
  }
  const localNumber = value.slice(matchedCountry.dialCode.length);
  if (localNumber.length < 6) {
    return `Номер телефона слишком короткий для ${matchedCountry.name}`;
  }
  if (localNumber.length > matchedCountry.maxLength) {
    return `Номер телефона слишком длинный для ${matchedCountry.name}`;
  }
  return true;
};

export default validatePhoneNumber;
