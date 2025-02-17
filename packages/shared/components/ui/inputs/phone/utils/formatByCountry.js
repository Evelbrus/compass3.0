import { countryData, formatByPattern } from '@shared/components/ui/inputs/phone';
export const formatByCountry = (countryCode, digits) => {
    const country = countryData.find((c) => c.code === countryCode);
    if (!country)
        return digits;
    return formatByPattern(digits, country.formatPattern);
};
