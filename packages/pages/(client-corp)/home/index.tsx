import React, { JSX } from 'react';
import HeroSection from '@pages/(client-corp)/home/hero-section/ui/HeroSection';

const HomeClientCorpPage: React.FC = (): JSX.Element => {
  return (
    <div className={'max-w-[1920px] min-h-[calc(100vh-80px)] p-5'}>
      <HeroSection />
    </div>
  );
};

export default HomeClientCorpPage;
