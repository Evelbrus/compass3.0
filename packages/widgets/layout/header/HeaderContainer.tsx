'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { UserSession } from '@shared/prisma/interface/users/interface';
import { publicRoutes } from '@shared/utils/routing';

const Profile = dynamic(() => import('@widgets/layout/header/profile/Profile'), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-gray-200 rounded-full" />,
});

const Notification = dynamic(() => import('@widgets/layout/header/notification/Notification'), {
  ssr: false,
  loading: () => <div className="w-8 h-8 bg-gray-200 rounded-full" />,
});

interface HeaderContainerProps {
  userSession?: UserSession | null;
}

const HeaderContainer: React.FC<HeaderContainerProps> = ({ userSession }) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleNavigate = (route: string) => {
    router.prefetch(route);
    router.push(route);
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Ошибка при выходе');
      }

      router.push(publicRoutes.LOGIN);
      router.refresh();
    } catch (error) {
      console.error('Ошибка:', error);
      //Можно добавить отображение ошибки пользователю
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="w-full flex flex-row justify-between">
      <Profile userSession={userSession} onLogout={logout} onNavigate={handleNavigate} />
      <Notification userSession={userSession} />
    </div>
  );
};

export default HeaderContainer;
