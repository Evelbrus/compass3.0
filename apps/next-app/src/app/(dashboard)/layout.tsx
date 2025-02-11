import React, { JSX, ReactNode } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import ModalManagerComponent from '@shared/components/modal/ModalManager';
import Sidebar from '@shared/components/layout/sidebar/ui/Sidebar';
import Header from '@widgets/layout/header/Header';
import { SocketProvider } from '@app/provider/SocketProvider';
import GradientBackground from '@shared/components/background/GradientBackground';

type RootLayoutProps = {
  children: ReactNode;
};

const BaseLayout = async ({ children }: RootLayoutProps): Promise<JSX.Element> => {
  const { userSession, role } = await getLayoutData();

  return (
    <>
      <SocketProvider>
        <div className="flex flex-row min-h-screen max-w-[1920px] mx-auto">
          <Sidebar role={role} />
          <div className={'relative w-full flex flex-col overflow-x-auto'}>
            <GradientBackground />
            <div className={'w-full flex flex-col z-50'}>
              <Header userSession={userSession} />
              <main className="min-h-[calc(100vh-80px)] z-10 p-4">{children}</main>
            </div>
          </div>
        </div>
        {role && <ModalManagerComponent role={role} />}
      </SocketProvider>
    </>
  );
};

export default BaseLayout;
