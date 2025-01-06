import { JSX } from 'react';
import { SelectOption } from '@shared/lib/effector';

export interface SelectProps<T extends string | number> {
  options: SelectOption<T>[];
  value: SelectOption<T> | null;
  onChange: (value: SelectOption<T> | null) => void;
  disabled?: boolean;
  className?: string;
  classNameBorderRadius?: string;
  classNameTagUl?: string;
  classNameTagLi?: string;
  classNameLabel?: string;
  classNamePlaceholder?: string;
  phoneSelect?: string;
  placeholder?: string | JSX.Element;
  label?: JSX.Element | string;
  prefix?: JSX.Element;
  isSearchable?: boolean;
  openDirection?: string;
}

export interface ExtendedSelectProps<T extends string | number> extends SelectProps<T> {
  error?: boolean;
  errorBorder?: boolean;
  hideArrow?: boolean;
  counter?: boolean;
  getIcon?: (value: T) => JSX.Element | null;
}
