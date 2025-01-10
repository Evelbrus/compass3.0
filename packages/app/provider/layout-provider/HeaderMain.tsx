import React from 'react';
import Header from '@shared/components/layout/header/ui/Header';
import GradientBackground from '@shared/components/background/GradientBackground';
import { CustomUser } from '@shared/lib/api/authOptions';

interface ProviderProps {
  lang: string;
  isAuthenticated: boolean;
  userProfile: CustomUser | null;
  children: React.ReactNode;
}

const HeaderMain: React.FC<ProviderProps> = ({ children, lang, isAuthenticated, userProfile }) => {
  return (
    <div className="flex flex-col flex-1 overflow-x-auto border border-gray-300 border-r-0 border-t-0 border-b-0 rounded-l-3xl shadow-lg relative bg-[#efefef]">
      <GradientBackground />
      <div className="z-20">
        <Header isAuthenticated={isAuthenticated} lang={lang} userProfile={userProfile} />
      </div>
      {children}
    </div>
  );
};

export default HeaderMain;
