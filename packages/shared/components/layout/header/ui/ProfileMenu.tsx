'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { profileMenuRoutes } from '@shared/utils/routing';
import { PolygonIcon } from '@shared/components/ui/icon';

interface ProfileMenuProps {
  onClose?: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ onClose }) => {
  const router = useRouter();

  const handleNavigation = (route: string) => {
    router.push(route);
    onClose?.();
  };

  const handleLogout = async () => {
    // try {
    //   await ();
    //   router.push('/login');
    // } catch (error) {
    //   console.error('Ошибка при выходе из системы:', error);
    // } finally {
    //   onClose?.();
    // }
  };

  return (
    <div
      onClick={onClose}
      className="left-[-1px] absolute top-[70px] w-[246px] bg-[var(--background)] border border-gray-300 rounded-tr-3xl rounded-br-3xl z-40"
    >
      <ul className="flex flex-col gap-2">
        <li
          className="hover:bg-gray-100 p-3 rounded-tr-3xl cursor-pointer"
          onClick={() => handleNavigation(profileMenuRoutes.PROFILE)}
        >
          Мой профиль
        </li>
        <li
          className="hover:bg-gray-100 p-3 rounded cursor-pointer"
          onClick={() => handleNavigation(profileMenuRoutes.SETTINGS)}
        >
          Настройки
        </li>
        <li
          className="hover:bg-gray-100 p-3 rounded cursor-pointer"
          onClick={() => handleNavigation(profileMenuRoutes.NOTIFICATIONS)}
        >
          Уведомления
        </li>
        <li className="hover:bg-gray-100 p-3 rounded-br-3xl cursor-pointer" onClick={handleLogout}>
          Выйти
        </li>
      </ul>
      <PolygonIcon className="absolute -top-4 left-1/2 -translate-x-1/2 rotate-60 fill-white w-6 h-6" />
    </div>
  );
};

export default ProfileMenu;
