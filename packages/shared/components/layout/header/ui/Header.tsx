'use client';

import React, { useEffect, useRef, useState } from 'react';
import { HeaderProps } from '@shared/components/layout/header';
import { IButton } from '@shared/components/ui/buttons';
import Icon from '@shared/components/ui/icon/Icon';
import ProfileMenu from '@shared/components/layout/header/ui/ProfileMenu';
import { roleTranslations } from '@shared/lib/effector/(users)/options-and-translation/optionsTranslationUser';
import { useSocket } from '@shared/utils/hooks/useSocket';

interface Notification {
  title: string;
  message: string;
}

const Header: React.FC<HeaderProps> = ({ userProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const socket = useSocket('notification', (notification: Notification) => {
    console.log('Notification received:', notification);
    setNotifications((prev) => [...prev, notification]);
  });

  useEffect(() => {
    if (socket && userProfile?.uuid) {
      socket.emit('register', userProfile.uuid);
    }
  }, [socket, userProfile]);

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
          badge={notifications.length}
          className="relative w-8 h-8 rounded-full bg-black flex items-center justify-center"
          badgeClassName="top-[-7px] right-[-7px] text-red-100 bg-red-600"
          onClick={() => setShowNotifications((prev) => !prev)}
          aria-label="Notifications"
        >
          <Icon
            name="bell"
            alt="Уведомления"
            className="w-6 h-6 text-current transition-colors duration-300"
          />
        </IButton>
        {showNotifications && (
          <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg p-4 w-64 z-10">
            {notifications.length === 0 ? (
              <p className="text-gray-500">У вас нет новых уведомлений</p>
            ) : (
              notifications.map((notification, index) => (
                <div key={index} className="p-2 border-b last:border-b-0">
                  <p className="font-bold">{notification.title}</p>
                  <p>{notification.message}</p>
                </div>
              ))
            )}
          </div>
        )}
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
