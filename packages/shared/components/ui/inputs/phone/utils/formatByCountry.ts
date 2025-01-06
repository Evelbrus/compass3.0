import { countryData, formatByPattern } from '@shared/components/ui/inputs/phone';

export const formatByCountry = (countryCode: string, dialCode: string, digits: string): string => {
  const country = countryData.find((c) => c.code === countryCode);
  if (!country) return digits;

  const formattedNumber = formatByPattern(digits, country.formatPattern);
  return formattedNumber;
};
