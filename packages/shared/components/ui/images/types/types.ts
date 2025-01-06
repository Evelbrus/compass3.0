import React from 'react';

export interface LazyImageProps {
  src: string;
  alt: string;
  quality?: number;
  blurDataURL?: string;
  priority?: boolean;
  sizes?: string;
  placeholder?: React.ReactNode;
  className?: string;
  enableHoverEffect?: boolean;
  overlay?: boolean;
  overlayClassName?: string;
  position?: string;
}
