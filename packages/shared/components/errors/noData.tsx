import React, { JSX } from 'react';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

interface NoDataProps {
  message?: string;
}

const NoData: React.FC<NoDataProps> = ({ message }) => {
  return (
    <AnimatedComponent
      className="w-full h-[510px] max-h-[510px] bg-white rounded-xl border"
      duration={500}
    >
      <div className="w-full h-full flex flex-col justify-center items-center">
        <LazyImage
          src="/404.webp"
          alt="No Found"
          className="w-[350px] h-[300px] object-cover"
          placeholder={<Skeleton width={350} height={300} />}
        />
        <h2 className="text-2xl font-bold text-[color:var(--text-black)] mb-2">
          {message || 'Пока что данных нет'}
        </h2>
      </div>
    </AnimatedComponent>
  );
};

export default NoData;
