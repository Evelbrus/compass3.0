import React, { JSX } from 'react';

export type IconTheme = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';

interface BaseButtonProps {
  label?: JSX.Element | string;
  labelClassName?: string;
  badge?: string | number;
  fullWidth?: boolean;
  iconBtnTheme?: 'square' | 'round';
  iconClassName?: string;
  textClassName?: string;
  theme?: IconTheme;
  variant?: 'solid' | 'outlined' | 'text' | 'close';
  isActive?: boolean;
  buttonPrefix?: React.ReactNode;
  buttonSuffix?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  customPrefix?: React.ReactNode;
  className?: string;
  classNameWrapperButton?: string;
  badgeClassName?: string;
  children?: React.ReactNode;
}

interface ButtonAsButtonProps
  extends BaseButtonProps,
    React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: undefined;
  tagName?: 'button';
}

interface ButtonAsAnchorProps
  extends BaseButtonProps,
    React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  tagName?: 'a';
}

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;
