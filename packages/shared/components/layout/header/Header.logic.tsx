'use client';

import React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { roleTranslations } from '@shared/lib/effector/(users)/options-and-translation/optionsTranslationUser';
import HeaderView from '@shared/components/layout/header/Header.view';
import { CustomUser } from '@shared/lib/api/authOptions';

interface Notification {
  id: string;
  title: string;
  message: string;
}

export interface HeaderProps {
  lang: string;
  isAuthenticated: boolean;
  userProfile: CustomUser | null;
}

const HeaderLogic: React.FC<HeaderProps> = ({ userProfile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const handleNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    setNotifications((prev) => [...prev, { ...notification, id: Date.now().toString() }]);
  }, []);

  const socket = useSocket('notification', handleNotification);

  useEffect(() => {
    let isMounted = true;

    const registerUser = () => {
      if (!isMounted || !socket || !userProfile?.uuid) return;

      console.log('Регистрация пользователя:', userProfile.uuid);
      socket.emit('register', userProfile.uuid, (response: { success: boolean }) => {
        if (!response.success) {
          console.error('Ошибка регистрации');
          //Дополнительная обработка ошибки
        }
      });
    };

    if (socket) {
      socket.connected ? registerUser() : socket.once('connect', registerUser);
    }

    return () => {
      isMounted = false;
      socket?.off('connect', registerUser);
    };
  }, [socket, userProfile?.uuid]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <HeaderView
      isMenuOpen={isMenuOpen}
      notifications={notifications}
      showNotifications={showNotifications}
      menuRef={menuRef}
      notificationRef={notificationRef}
      userProfile={userProfile ?? undefined}
      roleTranslations={roleTranslations}
      onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      onToggleNotifications={() => setShowNotifications((prev) => !prev)}
      onClearNotifications={handleClearNotifications}
    />
  );
};

export default HeaderLogic;
