//types/SelectTypes.ts (No changes)
import React, { JSX } from 'react';
import { SelectOption } from '@shared/lib/effector';

export interface BaseSelectProps<T extends string | number> {
  options: SelectOption<T>[];
  requiredStar?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  classNameBg?: string;
  classNamePadding?: string;
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
  error?: boolean;
  errorBorder?: boolean;
  hideArrow?: boolean;
  getIcon?: (value: T) => JSX.Element | null;
  isLoading?: boolean;
  message?: string;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose?: () => void;
  onOpen?: () => void;
}

export interface SelectSingleProps<T extends string | number> extends BaseSelectProps<T> {
  value: SelectOption<T> | null;
  onChange: (value: SelectOption<T> | null) => void;
}

export interface SelectMultipleProps<T extends string | number> extends BaseSelectProps<T> {
  value: SelectOption<T>[];
  onChange: (value: SelectOption<T>[]) => void;
}
