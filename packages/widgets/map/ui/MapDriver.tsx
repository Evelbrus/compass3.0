import React, { JSX } from 'react';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';

const MapDriver = (): JSX.Element => {
  return (
    <>
      <div className="w-full h-full flex flex-col justify-center items-center">
        <LazyImage
          src="/404.webp"
          alt="No Found"
          className="w-[350px] h-[300px] object-cover"
          placeholder={<Skeleton width={350} height={300} />}
        />
        <h2 className="text-2xl font-bold text-[color:var(--text-black)] mb-2">
          Карта в разработке
        </h2>
      </div>
    </>
  );
};

export default MapDriver;
