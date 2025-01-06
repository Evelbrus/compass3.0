import { JSX } from 'react';

export interface Option<T = string> {
  value: T;
  label?: string | JSX.Element;
}

export interface OptionLocation<T = string> extends Option<T> {}

export interface OptionTariff<T = string> extends Option<T> {
  maxPeople: number;
  price?: number | JSX.Element;
}

export type SelectOption<T extends string | number> = Option<T> | OptionTariff<T>;

export function isOptionTariff<T extends string | number>(
  option: SelectOption<T>,
): option is OptionTariff<T> {
  return 'maxPeople' in option;
}
