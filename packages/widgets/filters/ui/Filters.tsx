'use client';

import React from 'react';
import { IButton } from '@shared/components/ui/buttons';
import Icon from '@shared/components/ui/icon/Icon';
import { showToast } from '@shared/components/toast/ToastManager';

const Filters: React.FC = () => {
  const handleClick = () => {
    showToast.info('Функционал в разработке');
  };

  return (
    <>
      <IButton
        className="bg-white flex flex-row items-center gap-4 rounded-xl p-4 text-gray-500 hover:text-gray-900 button-hover-icon"
        buttonPrefix={
          <Icon
            name="filters"
            alt="Фильтры"
            className="w-6 h-6 text-current transition-colors duration-300"
          />
        }
        onClick={handleClick}
      >
        Фильтры
      </IButton>
    </>
  );
};

export default Filters;
