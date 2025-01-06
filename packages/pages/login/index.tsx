import React, { JSX } from 'react';
import LoginSection from '@pages/login/login-section/ui/LoginSection';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

interface HomeProps {
  lang: string;
  isAuthenticated: boolean;
}

const LoginPage = ({ lang, isAuthenticated }: HomeProps): JSX.Element => {
  return (
    <div className="max-w-[1920px] min-h-screen flex mx-auto">
      {/* Левая часть с фоном */}
      <div
        className="flex-1"
        style={{
          backgroundImage: "url('/compass.png')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left center',
        }}
      ></div>

      {/* Правая часть с LoginSection */}
      <div className="flex justify-center items-center w-[40%] bg- p-5">
        <AnimatedComponent duration={500} className="w-full">
          <LoginSection lang={lang} isAuthenticated={isAuthenticated} />
        </AnimatedComponent>
      </div>
    </div>
  );
};

export default LoginPage;
