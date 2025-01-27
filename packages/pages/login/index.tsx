import React from 'react';
import LoginSection from '@pages/login/login-section/ui/LoginSection';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

const LoginPage: React.FC = () => {
  return (
    <div className="max-w-[1920px] min-h-screen flex mx-auto">
      <div
        className="flex-1"
        style={{
          backgroundImage: "url('/compass.png')",
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left center',
        }}
      ></div>

      <div className="flex justify-center items-center w-[40%] bg- p-5">
        <AnimatedComponent duration={500} className="w-full">
          <LoginSection />
        </AnimatedComponent>
      </div>
    </div>
  );
};

export default LoginPage;
