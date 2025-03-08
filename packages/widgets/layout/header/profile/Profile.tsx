'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@shared/lib';
import Icon from '@shared/components/ui/icon/Icon';
import { roleTranslations } from '@shared/lib/effector/(users)/options-and-translation/optionsTranslationUser';
import { UserSession } from '@shared/prisma/interface/users/interface';
import { openModal, setUserFullName, setUserUuid } from '@shared/lib/effector';

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
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={cn(
            'w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md',
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
      </div>

      {isMenuOpen && (
        <div
          className={cn(
            'absolute right-0 mt-8 w-72 bg-white',
            'rounded-xl shadow-2xl z-50',
            'overflow-hidden',
            'transform transition-all duration-200 ease-out',
            'animate-in fade-in zoom-in-95',
          )}
        >
          {/* Шапка профиля с аватаром и информацией */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white">
                <Icon name="user" alt="Профиль" className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {userSessionFromProps?.email || 'Неавторизованный пользователь'}
                </div>
                <div className="text-xs text-white/80 truncate mt-0.5 flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1.5"></span>
                  {userSessionFromProps?.role
                    ? roleTranslations[userSessionFromProps.role]
                    : 'Роль не указана'}
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Пункты меню с иконками */}
            <ul className="flex flex-col">
              {userSessionFromProps?.uuid && (
                <li
                  className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    setUserUuid(userSessionFromProps.uuid);
                    setUserFullName('собственного профиля');
                    openModal('changePasswordModal');
                    setIsMenuOpen(false);
                  }}
                >
                  <div className="w-8 h-8 flex items-center justify-center text-gray-500">
                    <Icon name="lock" alt="Сменить пароль" className="w-5 h-5" />
                  </div>
                  <div className="ml-2">
                    <div className="text-sm font-medium text-gray-800">Сменить пароль</div>
                    <div className="text-xs text-gray-500 mt-0.5">Обновите данные безопасности</div>
                  </div>
                </li>
              )}
              <li
                className="flex items-center px-4 py-2.5 hover:bg-red-50 cursor-pointer transition-colors"
                onClick={() => {
                  setIsMenuOpen(false);
                  onLogout && onLogout();
                }}
              >
                <div className="w-8 h-8 flex items-center justify-center text-red-500">
                  <Icon name="log-out" alt="Выйти" className="w-5 h-5" />
                </div>
                <div className="ml-2">
                  <div className="text-sm font-medium text-red-600">Выйти</div>
                  <div className="text-xs text-red-500/70 mt-0.5">Завершить текущий сеанс</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
