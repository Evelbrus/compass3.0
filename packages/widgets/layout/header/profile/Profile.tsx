'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@shared/lib';
import { profileMenuRoutes } from '@shared/utils/routing';
import Icon from '@shared/components/ui/icon/Icon';
import { roleTranslations } from '@shared/lib/effector/(users)/options-and-translation/optionsTranslationUser';
import { UserSession } from '@shared/prisma/interface/users/interface';

interface ProfileIslandProps {
  userSession?: UserSession | null;
  onLogout?: () => void;
  onNavigate?: (route: string) => void;
}

const Profile = ({
  userSession: userSessionFromProps,
  onLogout,
  onNavigate,
}: ProfileIslandProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleMenuAction = (route: string) => {
    setIsMenuOpen(false);
    onNavigate?.(route);
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleScroll = () => {
      setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.addEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={cn(
            'w-12 h-12 rounded-full bg-white flex items-center justify-center',
            'hover:bg-gray-100 transition-colors',
          )}
          aria-label="Профиль пользователя"
          aria-expanded={isMenuOpen}
        >
          <Icon
            name="user"
            alt="Профиль"
            className="w-6 h-6 text-black hover:text-red-500 transition-colors duration-300"
          />
        </button>
        <span className="text-4 leading-4 font-medium">
          {userSessionFromProps?.role
            ? roleTranslations[userSessionFromProps.role]
            : 'Неизвестная роль'}
        </span>
      </div>

      {isMenuOpen && (
        <div
          className={cn(
            'absolute left-0 mt-2 w-48 bg-white',
            'rounded-lg shadow-xl z-50',
            'border border-gray-100',
          )}
        >
          <div className="px-4 py-2 text-sm text-gray-700 truncate">
            {userSessionFromProps?.email || 'Неавторизованный пользователь'}
          </div>

          <div className="border-t border-gray-100 my-1" />

          <ul className="flex flex-col gap-1">
            {/*<li*/}
            {/*className="hover:bg-gray-100 px-4 py-2 cursor-pointer text-sm"*/}
            {/*onClick={() => handleMenuAction(profileMenuRoutes.PROFILE)}*/}
            {/*>*/}
            {/*Мой профиль*/}
            {/*</li>*/}
            {/*<li*/}
            {/*className="hover:bg-gray-100 px-4 py-2 cursor-pointer text-sm"*/}
            {/*onClick={() => handleMenuAction(profileMenuRoutes.SETTINGS)}*/}
            {/*>*/}
            {/*Настройки*/}
            {/*</li>*/}
            {/*<li*/}
            {/*className="hover:bg-gray-100 px-4 py-2 cursor-pointer text-sm"*/}
            {/*onClick={() => handleMenuAction(profileMenuRoutes.NOTIFICATIONS)}*/}
            {/*>*/}
            {/*Уведомления*/}
            {/*</li>*/}
            <li
              className="hover:bg-gray-100 px-4 py-2 cursor-pointer text-sm text-red-600"
              onClick={() => {
                setIsMenuOpen(false);
                if (onLogout) {
                  onLogout();
                }
              }}
            >
              Выйти
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Profile;
