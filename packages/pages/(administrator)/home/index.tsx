import React, { JSX } from 'react';
import HeroSection from '@pages/(administrator)/home/hero-section/ui/HeroSection';

const HomeAdminPage: React.FC = (): JSX.Element => {
  return (
    <div className={'max-w-[1920px] min-h-[calc(100vh-80px)] p-5'}>
      <HeroSection />
    </div>
  );
};

export default HomeAdminPage;
