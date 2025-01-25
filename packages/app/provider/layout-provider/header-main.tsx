import React, { Suspense } from 'react';
import { StaticHeader } from '@entities/layout/header/static-header';
import { CustomUser } from '@shared/lib/api/authOptions';
import GradientBackground from '@shared/components/background/GradientBackground';
import HeaderIslands from '@app/provider/layout-provider/header-islands';

const HeaderMain = ({
  children,
  userProfile,
}: {
  children: React.ReactNode;
  userProfile?: CustomUser;
}) => {
  return (
    <div className="flex flex-col flex-1 overflow-x-auto border border-gray-300 border-r-0 border-t-0 border-b-0 rounded-l-3xl shadow-lg relative bg-[#efefef]">
      <GradientBackground />

      <StaticHeader
        additionalContent={
          <Suspense fallback={<HeaderIslandsSkeleton />}>
            {/*Клиентские острова */}
            <HeaderIslands userProfile={userProfile} />
          </Suspense>
        }
      />

      {children}
    </div>
  );
};

export default HeaderMain;

const HeaderIslandsSkeleton = () => {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
    </div>
  );
};
