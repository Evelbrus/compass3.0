'use client';

import React from 'react';
import { useRouter as useNextRouter } from 'next/navigation';

export function handleButtonClick<E extends HTMLButtonElement | HTMLAnchorElement>(
  event: React.MouseEvent<E>,
  href: string | undefined,
  isClient: boolean,
  router: ReturnType<typeof useNextRouter>,
  onClick?: React.MouseEventHandler<E>,
) {
  if (href && isClient) {
    event.preventDefault();
    router.push(href);
  }
  if (onClick) {
    onClick(event);
  }
}
