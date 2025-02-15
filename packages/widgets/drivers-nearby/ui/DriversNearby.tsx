'use client';

import React, { useCallback, useEffect } from 'react';
import NoData from '@shared/components/errors/noData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import Pagination from '@shared/components/ui/pagination/Pagination';
import { TextInput } from '@shared/components/ui/inputs';
import { LazyImage } from '@shared/components/ui/images';
import { isDriverOnline } from '@widgets/drivers-nearby/fucntions/isDriverOnline';
import { User } from '@prisma/client';
import { useFormContext } from 'react-hook-form';

interface DriversNearbyProps {
  drivers: User[] | null;
  page?: number;
  perPage?: number;
  currentTotal: number;
  isDriversLoading: boolean;
  searchDriver: string;
  selectedDriverInfo: User | null;
  serverTime?: Date | null;
  handleSearchDriverChange: (value: string) => void;
  handlePageChange: (newPage: number) => void;
  handleDriverClick: (driverId: string) => void;
}

const DriversNearby: React.FC<DriversNearbyProps> = ({
  drivers,
  page = 1,
  perPage = 10,
  currentTotal,
  isDriversLoading,
  searchDriver,
  handleSearchDriverChange,
  handlePageChange,
  handleDriverClick,
  selectedDriverInfo,
  serverTime,
}) => {
  const { watch, setValue } = useFormContext();
  const formData = watch();

  useEffect(() => {
    if (selectedDriverInfo) {
      setValue('assignedDriverId', selectedDriverInfo.uuid);
    }
  }, [selectedDriverInfo, setValue]);

  const handleDriverRowClick = useCallback(
    (driverId: string) => {
      if (formData.assignedDriverId === driverId) {
        setValue('assignedDriverId', undefined);
      } else {
        setValue('assignedDriverId', driverId);
      }
      handleDriverClick(driverId);
    },
    [setValue, handleDriverClick, formData.assignedDriverId],
  );

  return (
    <>
      <div className="w-full h-full flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold leading-9">Водители поблизости</h1>
        <TextInput
          classNamePadding="text-5 font-light leading-5 p-5 rounded-3xl shadow-3xl"
          placeholder="Поиск по ФИО"
          value={searchDriver}
          onChange={(value: string | number | bigint | null) => {
            if (value === null) {
              //Обрабатываем случай null, если это необходимо
              handleSearchDriverChange('');
            } else if (typeof value === 'string') {
              handleSearchDriverChange(value);
            } else {
              console.warn(
                'TextInput вернул число или bigint. Ожидалась строка для поиска по ФИО.',
              );
            }
          }}
        />
        <AnimatedComponent className="w-full h-full bg-transparent rounded-lg">
          {isDriversLoading ? null : !drivers || drivers.length === 0 ? (
            <NoData message="Нет доступных водителей" />
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse rounded-md bg-white border-[#0000001A]">
                <tbody>
                  {drivers.map((driver) => {
                    const isSelected = selectedDriverInfo?.uuid === driver.uuid;

                    const serverTimeISO = serverTime
                      ? serverTime instanceof Date
                        ? serverTime.toISOString()
                        : serverTime
                      : new Date().toISOString();

                    const isOnline = isDriverOnline(driver.lastActive, serverTimeISO);

                    return (
                      <tr
                        key={driver.uuid}
                        className={`relative flex p-4 gap-4 cursor-pointer border-b border-[#0000001A] hover:bg-gray-100 last:border-b-0 w-full ${
                          isSelected ? 'bg-blue-100' : ''
                        }`}
                        onClick={() => handleDriverRowClick(driver.uuid)}
                      >
                        <td className="flex justify-center">
                          <div className="relative w-[50px] h-[50px]">
                            <LazyImage
                              src={driver.profilePhotoPath || '/icons/user-driver.svg'}
                              alt="Driver Avatar"
                              className="w-[50px] h-[50px] rounded-full object-cover bg-white border"
                            />
                            <div
                              className={`absolute top-0 left-0 w-4 h-4 rounded-full border-2 ${
                                isOnline ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                          </div>
                        </td>
                        <td className="flex flex-col items-center justify-center">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`absolute top-1 left-1/2 text-3 leading-3 font-medium self-start ${
                                isOnline ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {isOnline ? 'В сети' : 'Не в сети'}
                            </span>
                            <p className="text-5 leading-5 font-medium">{driver.fullName}</p>
                            <p className="text-4 leading-4 font-light">{driver.phone}</p>
                          </div>
                        </td>
                        {isSelected && (
                          <td className="absolute right-4 top-1/2 -translate-y-1/2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-6 w-6 text-green-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AnimatedComponent>
      </div>

      {currentTotal > perPage && (
        <Pagination
          pageNumber={page}
          pageSize={perPage}
          totalCount={currentTotal}
          setPageNumber={(newPage) => handlePageChange(Number(newPage))}
        />
      )}
    </>
  );
};

export default DriversNearby;
