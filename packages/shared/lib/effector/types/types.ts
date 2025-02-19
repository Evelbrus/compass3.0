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
