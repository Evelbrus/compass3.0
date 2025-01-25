'use client';

import React from 'react';
import { IButton } from '@shared/components/ui/buttons';
import Icon from '@shared/components/ui/icon/Icon';
import ProfileMenu from './ProfileMenu';
import { roleTranslationsType } from '@shared/lib/effector/(users)/options-and-translation/optionsTranslationUser';

export interface HeaderViewProps {
  isMenuOpen: boolean;
  notifications: Array<{ id: string; title: string; message: string }>;
  showNotifications: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  notificationRef: React.RefObject<HTMLDivElement | null>;
  userProfile?: {
    uuid?: string;
    role?: keyof roleTranslationsType;
  };
  roleTranslations: roleTranslationsType;
  onToggleMenu: () => void;
  onToggleNotifications: () => void;
  onClearNotifications: () => void;
}

const HeaderView: React.FC<HeaderViewProps> = ({
  isMenuOpen,
  notifications,
  showNotifications,
  menuRef,
  notificationRef,
  userProfile,
  roleTranslations,
  onToggleMenu,
  onToggleNotifications,
  onClearNotifications,
}) => (
  <header className="p-4 flex justify-between items-center max-h-[300px] relative">
    {/*Левая часть */}
    <div className="flex items-center space-x-4">
      <div
        className="w-12 h-12 rounded-full bg-white flex items-center justify-center
        hover:shadow-[0px_0px_5px_rgba(255,255,255,0.5)] cursor-pointer"
        onClick={onToggleMenu}
        role="button"
        aria-label="Профиль пользователя"
        aria-expanded={isMenuOpen}
      >
        <Icon
          name="user"
          alt="Профиль"
          className="w-6 h-6 text-black hover:text-red-500 transition-colors duration-300"
        />
      </div>
      <span className="text-4 leading-4 font-medium">
        {userProfile?.role ? roleTranslations[userProfile.role] : 'Неизвестная роль'}
      </span>

      {isMenuOpen && (
        <div ref={menuRef}>
          <ProfileMenu onClose={onToggleMenu} />
        </div>
      )}
    </div>

    {/*Правая часть */}
    <div className="flex items-center space-x-4">
      <IButton
        badge={notifications.length}
        className="relative w-8 h-8 rounded-full bg-black flex items-center justify-center"
        badgeClassName="top-[-7px] right-[-7px] text-red-100 bg-red-600"
        onClick={onToggleNotifications}
        aria-label="Уведомления"
        aria-expanded={showNotifications}
        aria-controls="notifications-dropdown"
      >
        <Icon name="bell" alt="Уведомления" className="w-6 h-6 text-current" />
      </IButton>

      {showNotifications && (
        <div
          ref={notificationRef}
          id="notifications-dropdown"
          role="menu"
          aria-orientation="vertical"
          className="absolute top-12 right-0 bg-white rounded-lg shadow-lg p-4 w-64 z-10 max-h-80 overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Уведомления</h3>
            <button
              onClick={onClearNotifications}
              className="text-blue-600 text-sm hover:text-blue-800 transition-colors"
              aria-label="Очистить уведомления"
            >
              Очистить
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-gray-500">Нет уведомлений</p>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="p-2 border-b last:border-b-0">
                <p className="font-bold">{notification.title}</p>
                <p className="text-sm">{notification.message}</p>
              </div>
            ))
          )}
        </div>
      )}

      <IButton
        className="w-8 h-8 rounded-full bg-black flex items-center justify-center"
        onClick={() => console.log('Добавить')}
        aria-label="Добавить"
      >
        <Icon name="plus" alt="Добавить" className="w-4 h-4 text-current" />
      </IButton>
    </div>
  </header>
);

export default HeaderView;
