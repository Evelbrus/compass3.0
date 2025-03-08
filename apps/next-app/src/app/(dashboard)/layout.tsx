import React, { JSX, ReactNode } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import Sidebar from '@shared/components/layout/sidebar/ui/Sidebar';
import Header from '@widgets/layout/header/Header';
import { SocketProvider } from '@app/provider/SocketProvider';
import GradientBackground from '@shared/components/background/GradientBackground';
import ModalManagerComponent from '@widgets/modal/ModalManager';

type RootLayoutProps = {
  children: ReactNode;
};

const BaseLayout = async ({ children }: RootLayoutProps): Promise<JSX.Element> => {
  const { userSession, role } = await getLayoutData();

  return (
    <>
      <SocketProvider>
        {/* Контейнер с фиксированной максимальной шириной */}
        <div className="grid grid-cols-[300px_minmax(0,_1fr)] min-h-screen w-full mx-auto">
          {/* Сайдбар с фиксированной шириной в 300px */}
          <div className="bg-gradient-to-r to-indigo-700/5 from-blue-600/15">
            <Sidebar role={role} />
          </div>

          {/* Контент с автоматической шириной (оставшееся пространство до 1920px) */}
          <div className="relative flex flex-col">
            {/* Хедер с sticky-поведением */}
            <div className="sticky top-0 z-30 w-full">
              <Header userSession={userSession} />
            </div>

            {/* Область основного контента */}
            <div className="flex-1 md:rounded-bl-3xl lg:rounded-bl-3xl overflow-auto">
              <GradientBackground />
              <div className="relative w-full flex flex-col z-20">
                <main className="flex-1">{children}</main>
              </div>
            </div>
          </div>
        </div>
        {role && <ModalManagerComponent role={role} userSession={userSession} />}
      </SocketProvider>
    </>
  );
};

export default BaseLayout;