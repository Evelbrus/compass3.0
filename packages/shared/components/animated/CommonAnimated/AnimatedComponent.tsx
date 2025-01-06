'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@shared/lib';

interface AnimatedComponentProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  visible?: boolean; // Управление видимостью
}

const AnimatedComponent: React.FC<AnimatedComponentProps> = ({
  children,
  className,
  duration = 500,
  visible = true,
}) => {
  const [animationStart, setAnimationStart] = useState(false);

  useEffect(() => {
    // Обновляем состояние анимации при изменении видимости
    setAnimationStart(visible);
  }, [visible]);

  return (
    <div
      className={cn(
        `transition-opacity duration-${duration}`,
        animationStart ? 'opacity-100' : 'opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
};

export default AnimatedComponent;
