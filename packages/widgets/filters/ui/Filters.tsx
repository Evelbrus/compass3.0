'use client';

import React from 'react';
import { IButton } from '@shared/components/ui/buttons';
import Icon from '@shared/components/ui/icon/Icon';

const Filters: React.FC = () => {
  return (
    <>
      <IButton
        className="bg-white flex flex-row items-center gap-4 rounded-xl p-4 text-gray-500 hover:text-gray-900 button-hover-icon"
        buttonPrefix={
          <Icon
            name="filters"
            alt="Корзина"
            className="w-6 h-6 text-current transition-colors duration-300"
          />
        }
      >
        Фильтры
      </IButton>
    </>
  );
};

export default Filters;
