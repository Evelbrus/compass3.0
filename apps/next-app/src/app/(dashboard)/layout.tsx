import React, { JSX, ReactNode } from 'react';
import { getLayoutData } from '@shared/utils/cookie/layout-data/getLayoutData';
import ClientProvider from '@app/provider/layout-provider/ClientProvider';
import ModalManagerComponent from '@shared/components/modal/ModalManager';

type RootLayoutProps = {
  children: ReactNode;
};

const BaseLayout = async ({ children }: RootLayoutProps): Promise<JSX.Element> => {
  const { lang, isAuthenticated, userProfile, role } = await getLayoutData();

  return (
    <>
      <ClientProvider lang={lang} isAuthenticated={isAuthenticated} userProfile={userProfile}>
        {children}
      </ClientProvider>
      {role && <ModalManagerComponent role={role} />}
    </>
  );
};

export default BaseLayout;
