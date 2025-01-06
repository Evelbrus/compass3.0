import React from 'react';
import Sidebar from '@shared/components/layout/sidebar/ui/Sidebar';
import HeaderMain from '@app/provider/layout-provider/HeaderMain';
import { UserProfile } from '@shared/lib/effector';
import { UserRole } from '@prisma/client';

interface ProviderProps {
  children: React.ReactNode;
  lang: string;
  isAuthenticated: boolean;
  userProfile: UserProfile | null;
}

const ClientProvider: React.FC<ProviderProps> = ({
  children,
  lang,
  isAuthenticated,
  userProfile,
}) => {
  const role: UserRole | undefined = userProfile?.role;
  if (!role) {
    return null;
  }

  return (
    <div className="flex flex-row min-h-screen max-w-[1920px] mx-auto">
      <Sidebar isAuthenticated={isAuthenticated} lang={lang} role={role} />
      <HeaderMain isAuthenticated={isAuthenticated} lang={lang} userProfile={userProfile}>
        <main className="min-h-[calc(100vh-80px)] z-10 p-4">{children}</main>
      </HeaderMain>
    </div>
  );
};

export default ClientProvider;
