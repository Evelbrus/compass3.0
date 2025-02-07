import React from 'react';
import { LazyImage } from '@shared/components/ui/images';
import { Skeleton } from '@shared/components/ui/skeleton/Skeleton';
import { isDriverOnline } from '@widgets/drivers-nearby/fucntions/isDriverOnline';
import { User } from '@prisma/client';

interface MapDriverProps {
  selectedDriverInfo: User | null;
  serverTime?: string | Date | null;
}

const MapDriver: React.FC<MapDriverProps> = ({ selectedDriverInfo, serverTime }) => {
  return (
    <>
      <div className="relative w-full h-full flex flex-col justify-center items-center">
        {/*Карточка выбранного водителя */}
        {selectedDriverInfo && (
          <div className={'absolute flex flex-col  top-2 left-2 rounded-md gap-2 z-30'}>
            <label className="text-5 leading-5 font-bold">Выбранный водитель:</label>

            <div className="min-w-[500px] bg-blue-200 p-4 border rounded-md flex gap-4 items-center">
              <div className="w-[50px] h-[50px] relative">
                <LazyImage
                  src={selectedDriverInfo.profilePhotoPath || '/icons/user-driver.svg'}
                  alt="Selected Driver Avatar"
                  className="w-[50px] h-[50px] rounded-full object-cover bg-white border"
                />
                <div
                  className={`absolute top-0 left-0 w-4 h-4 rounded-full border-2 ${
                    isDriverOnline(selectedDriverInfo.lastActive, serverTime || null)
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                />
              </div>
              <div>
                <p className="text-5 leading-5 font-medium">{selectedDriverInfo.fullName}</p>
                <p className="text-4 leading-4 font-light">{selectedDriverInfo.phone}</p>
              </div>
            </div>
          </div>
        )}
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
