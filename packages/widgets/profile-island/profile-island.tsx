//widgets/profile-island/profile-island.tsx
'use client';

import { useState, useRef } from 'react';
import { useOnClickOutside } from '@shared/utils/hooks/useClickOutside';
import { CustomUser } from '@shared/lib/api/authOptions';
import { cn } from '@shared/lib';

interface ProfileIslandProps {
  userProfile?: CustomUser | null;
  onLogout?: () => void;
}

const ProfileIsland = ({ userProfile, onLogout }: ProfileIslandProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(menuRef, () => setIsMenuOpen(false));

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={cn(
          'flex items-center gap-2 p-2 rounded-full',
          'hover:bg-gray-100 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary',
        )}
        aria-label="Профиль пользователя"
        aria-expanded={isMenuOpen}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            'bg-blue-500 text-white font-medium text-sm',
            'shadow-sm hover:shadow-md transition-shadow',
          )}
        >
          {userProfile?.email?.[0]?.toUpperCase() || '👤'}
        </div>
      </button>

      {isMenuOpen && (
        <div
          className={cn(
            'absolute left-0 mt-2 w-48 bg-white',
            'rounded-lg shadow-xl z-50 py-2',
            'border border-gray-100',
          )}
        >
          <div className="px-4 py-2 text-sm text-gray-700">{userProfile?.email}</div>

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={onLogout}
            className={cn(
              'w-full px-4 py-2 text-sm text-left',
              'hover:bg-gray-50 transition-colors',
              'text-red-600 hover:text-red-700',
            )}
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileIsland;
