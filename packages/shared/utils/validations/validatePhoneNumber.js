import { countryData } from '@shared/components/ui/inputs/phone';
const validatePhoneNumber = (value) => {
    if (!value)
        return 'Номер телефона обязателен';
    const matchedCountry = countryData.find((country) => value.startsWith(country.dialCode));
    if (!matchedCountry) {
        return 'Неизвестный код страны';
    }
    const localNumber = value.slice(matchedCountry.dialCode.length);
    if (localNumber.length < matchedCountry.minLength) {
        return `Номер телефона слишком короткий для ${matchedCountry.name}`;
    }
    if (localNumber.length > matchedCountry.maxLength) {
        return `Номер телефона слишком длинный для ${matchedCountry.name}`;
    }
    return true;
};
export default validatePhoneNumber;
