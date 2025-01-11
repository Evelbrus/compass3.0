import React from 'react';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

const HeroSection: React.FC = () => {
  return (
    <section className="hero bg-gray-100 p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12">
      {}
      <header className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-14 lg:mb-16">
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800">
          Добро пожаловать
        </h1>
      </header>
      {}
      <AnimatedComponent
        className="overflow-x-auto rounded-lg shadow-md ease-custom p-2 xs:p-4 sm:p-6 md:p-8 lg:p-10"
        duration={500}
      >
        <h1>Главная страница АДМИНИСТРАТОРА</h1>
      </AnimatedComponent>
    </section>
  );
};

export default HeroSection;
