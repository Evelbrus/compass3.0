import React, { ReactNode, Suspense } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import Sidebar from '@shared/components/layout/sidebar/ui/Sidebar';
import { SocketProvider } from '@app/provider/SocketProvider';
import GradientBackground from '@shared/components/background/GradientBackground';
import ModalManagerComponent from '@widgets/modal/ModalManager';
import { redirect } from 'next/navigation';
import HeaderContainer from '@widgets/layout/header/HeaderContainer';

type RootLayoutProps = {
  children: ReactNode;
};

const BaseLayout = async ({ children }: RootLayoutProps) => {
  const { userSession, role } = await getLayoutData();

  if (!role) {
    redirect('/login');
  }

  return (
    <>
      <div className="w-full min-h-screen flex flex-col">
        <div className="flex flex-row md:flex-row flex-1">
          <div className="hidden lg:block lg:w-[220px] flex-shrink-0">
            <Sidebar role={role} />
          </div>
          <div className="flex-1 flex flex-col min-w-0">
            <div className="bg-gradient-to-r from-indigo-700/5 via-blue-600/20 to-indigo-700/5 flex-1 overflow-auto relative">
            {/* <GradientBackground /> */}
              <SocketProvider>
                <HeaderContainer userSession={userSession} />
              </SocketProvider>
              <div className="relative w-full flex flex-col z-20">
                <main className="flex-1 flex flex-col gap-4 transition">{children}</main>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalManagerComponent role={role} />
    </>
  );
};

export default BaseLayout;
