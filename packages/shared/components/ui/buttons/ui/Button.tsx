'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@shared/lib';
import {
  ButtonProps,
  baseClass,
  closeClass,
  defaultClass,
  outlinedClass,
  textClass,
  handleButtonClick,
} from '@shared/components/ui/buttons';

export const IButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      variant = 'solid',
      className = 'p-1 w-[200px] h-[56px] rounded-lg border-none bg-[color:var(--button-secondary)]\n' +
        'text-white font-semibold transition duration-300 ease-in-out\n' +
        'hover:bg-[color:var(--button-secondary-hover)]',
      href,
      onClick,
      type = 'button',
      fullWidth,
      iconClassName,
      textClassName = 'text-4 leading-4 text-medium justify-center',
      badge,
      badgeClassName,
      size = 'medium',
      theme,
      iconBtnTheme,
      tagName,
      isActive,
      buttonPrefix,
      buttonSuffix,
      customPrefix,
      label,
      labelClassName = 'block text-4 leading-4 font-medium text-gray-700',
      ...props
    },
    ref,
  ) => {
    const isClient = typeof window !== 'undefined';
    const router = useRouter();

    const themeClass = theme ? `btn-theme-${theme}` : '';
    const iconBtnThemeClass = iconBtnTheme === 'round' ? 'rounded-full' : 'rounded';
    const variantClass =
      variant === 'outlined'
        ? outlinedClass
        : variant === 'text'
          ? textClass
          : variant === 'close'
            ? closeClass
            : defaultClass;
    const fullWidthClass = fullWidth ? 'w-full' : '';

    const combinedClass = cn(
      baseClass,
      variantClass,
      themeClass,
      iconBtnThemeClass,
      fullWidthClass,
      className,
    );

    const renderContent = () => (
      <>
        {badge && (
          <span
            className={cn(
              'absolute inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full',
              badgeClassName,
            )}
          >
            {badge}
          </span>
        )}
        {buttonPrefix && (
          <span className={cn('icon flex-shrink-0', iconClassName)}>{buttonPrefix}</span>
        )}
        {customPrefix && <span>{customPrefix}</span>}
        <span className={cn('flex whitespace-pre-wrap', textClassName)}>{props.children}</span>
        {buttonSuffix && (
          <span className={cn('icon flex-shrink-0', iconClassName)}>{buttonSuffix}</span>
        )}
      </>
    );

    const renderLabel = () => (label ? <span className={cn(labelClassName)}>{label}</span> : null);

    if (href || tagName === 'a') {
      const anchorProps = props as React.AnchorHTMLAttributes<HTMLAnchorElement>;
      return (
        <>
          {renderLabel()}
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            className={combinedClass}
            onClick={(event: React.MouseEvent<HTMLAnchorElement>) =>
              handleButtonClick<HTMLAnchorElement>(
                event,
                href,
                isClient,
                router,
                onClick as React.MouseEventHandler<HTMLAnchorElement>,
              )
            }
            {...anchorProps}
          >
            {renderContent()}
          </a>
        </>
      );
    }

    const buttonProps = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <>
        {renderLabel()}
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type={type as 'button' | 'submit' | 'reset'}
          className={combinedClass}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
            handleButtonClick<HTMLButtonElement>(
              event,
              href,
              isClient,
              router,
              onClick as React.MouseEventHandler<HTMLButtonElement>,
            )
          }
          {...buttonProps}
        >
          {renderContent()}
        </button>
      </>
    );
  },
);

IButton.displayName = 'IButton';
