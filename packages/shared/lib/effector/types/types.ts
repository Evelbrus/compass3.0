//@shared/lib/effector/types/types.ts
import { JSX } from 'react';

/**
 * Базовая опция
 */
export interface OptionBase<T = string> {
  value: T;
  label?: string | JSX.Element;
  searchText?: string;
}

/**
 * Опция-«тариф»: например, имеет maxPeople
 */
export interface OptionTariff<T = string> extends OptionBase<T> {
  maxPeople: number;
  price?: number | JSX.Element;
}

/**
 * Объединённый тип, если нужно различать обычные и тарифные опции
 */
export type SelectOption<T extends string | number> = OptionBase<T> | OptionTariff<T>;

/**
 * Пример отдельного типа опции для стран,
 * где нужно поле compactLabel: JSX.Element
 */
export interface CountryOption extends OptionBase<string> {
  /**
   * Поле для "компактного" отображения,
   * чтобы хранить короткий JSX-вариант метки.
   */
  compactLabel: JSX.Element;
}

/**
 * Type guard, если нужно проверить тарифную опцию
 */
export function isOptionTariff<T extends string | number>(
  option: SelectOption<T>,
): option is OptionTariff<T> {
  return (option as OptionTariff<T>).maxPeople !== undefined;
}
