import React from 'react';
import RegisterSection from '@pages/register/register-section/ui/RegisterSection';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

const RegisterPage: React.FC = () => {
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
          <RegisterSection />
        </AnimatedComponent>
      </div>
    </div>
  );
};

export default RegisterPage;
