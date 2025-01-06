import { JSX } from 'react';
import { CurrencyOption } from '@shared/components/ui/inputs/currency-input';

export function handleCurrencyChange(
  option: { value: string; label: string | JSX.Element } | null,
  currencyOptions: CurrencyOption[],
  setSelectedCurrency: (currency: CurrencyOption) => void,
) {
  if (!option) return;
  const selected = currencyOptions.find((currency) => currency.code === option.value);
  if (selected) {
    setSelectedCurrency(selected);
  }
}
