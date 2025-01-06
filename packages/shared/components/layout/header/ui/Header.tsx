'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HeaderProps } from '@shared/components/layout/header';
import { IButton } from '@shared/components/ui/buttons';
import Icon from '@shared/components/ui/icon/Icon';
import ProfileMenu from '@shared/components/layout/header/ui/ProfileMenu';
import { roleTranslations } from '@shared/lib/effector';

const Header: React.FC<HeaderProps> = ({ userProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  //Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="p-4 flex justify-between items-center max-h-[300px] relative">
      <div className="flex items-center space-x-4">
        <div
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center
          hover:shadow-[0px_0px_5px_rgba(255,255,255,0.5)] cursor-pointer"
          onClick={handleToggleMenu}
        >
          <Icon
            name="user"
            alt="Водители"
            className="w-6 h-6 text-black hover:text-red-500 transition-colors duration-300"
          />
        </div>
        <span className="text-4 leading-4 font-medium">
          {userProfile?.role ? roleTranslations[userProfile.role] : 'Неизвестная роль'}
        </span>
        {isMenuOpen && (
          <div ref={menuRef}>
            <ProfileMenu onClose={() => setIsMenuOpen(false)} />
          </div>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <IButton
          badge={5}
          className="relative w-8 h-8 rounded-full bg-black flex items-center justify-center"
          badgeClassName="top-[-7px] right-[-7px] text-red-100 bg-red-600"
          onClick={() => console.log('Bell clicked')}
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            alt="Уведомления"
            className="w-6 h-6 text-current transition-colors duration-300"
          />
        </IButton>
        <IButton
          className="w-8 h-8 rounded-full bg-black flex items-center justify-center"
          onClick={() => console.log('Plus clicked')}
          aria-label="Add"
        >
          <Icon
            name="plus"
            alt="Создать"
            className="w-4 h-4 text-current transition-colors duration-300"
          />
        </IButton>
      </div>
    </header>
  );
};

export default Header;
