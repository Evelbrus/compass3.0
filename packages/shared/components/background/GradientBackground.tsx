'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useUnit } from 'effector-react';
import {
  $currentEntityStatus,
  setCurrentEntityStatus,
} from '@shared/lib/effector/gradient/gradientStore';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { gradientConfig } from '@shared/lib/effector/gradient/gradientConfig';

const defaultGradient = 'bg-[#efefef]';

const GradientBackground: React.FC = () => {
  const pathname = usePathname();
  const currentEntityStatus = useUnit($currentEntityStatus);

  useEffect(() => {
    //Определяем сущность на основе текущего пути
    let entity: string;
    let status: string | null = null;

    if (pathname.startsWith('/orders')) {
      entity = 'ORDERS';
      //Здесь можно получить текущий статус заказа, если он есть
      //Например, из состояния Effector или других источников
      status = currentEntityStatus.status; //Предполагается, что статус уже установлен
    } else if (pathname.startsWith('/clients')) {
      entity = 'CLIENTS';
      //Здесь можно получить текущую роль клиента, если она есть
      status = currentEntityStatus.status; //Предполагается, что статус уже установлен
    } else {
      entity = 'DEFAULT';
      status = 'DEFAULT';
    }

    //Обновляем состояние Effector
    setCurrentEntityStatus({ entity, status });
  }, [pathname]);

  const { entity, status } = currentEntityStatus;

  let newGradient = defaultGradient; //Стандартный градиент

  if (entity === 'ORDERCREATE') {
    newGradient = 'bg-gradient-to-r from-gray-100 via-gray-100';
  } else if (entity && status && entity !== 'DEFAULT') {
    newGradient = `bg-gradient-to-r ${gradientConfig[entity]?.[status] || 'from-gray-300 via-gray-300'}`;
  }

  return (
    <div className="absolute inset-0">
      <AnimatedComponent visible={!!newGradient} duration={1000}>
        <div
          className={`absolute inset-0 bg-gradient-to-r md:rounded-l-3xl lg:rounded-l-3xl ${newGradient}`}
          style={{ pointerEvents: 'none' }}
        />
      </AnimatedComponent>
    </div>
  );
};

export default GradientBackground;
