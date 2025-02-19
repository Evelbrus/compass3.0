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
 * Объединённый тип, если нужно различать обычные и тарифные опции
 */
export type SelectOption<T extends string | number> = OptionBase<T>;

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
