import React, { Suspense } from 'react';
import { StaticHeader } from '@entities/layout/header/static-header';
import HeaderContainer from '@widgets/layout/header/HeaderContainer';
import { UserSession } from '@shared/prisma/interface/users/interface';

interface HeaderProps {
  userSession?: UserSession | null;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ userSession }) => {
  return (
    <StaticHeader
      additionalContent={
        <Suspense fallback={<HeaderIslandsSkeleton />}>
          <HeaderContainer userSession={userSession} />
        </Suspense>
      }
    />
  );
};

export default Header;

const HeaderIslandsSkeleton = () => {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
    </div>
  );
};
