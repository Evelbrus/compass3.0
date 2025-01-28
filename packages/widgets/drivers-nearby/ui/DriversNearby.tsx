'use client';

import React, { useCallback } from 'react';
import NoData from '@shared/components/errors/noData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import Pagination from '@shared/components/ui/pagination/Pagination';
import { TextInput } from '@shared/components/ui/inputs';
import { LazyImage } from '@shared/components/ui/images';
import { isDriverOnline } from '@widgets/drivers-nearby/fucntions/isDriverOnline';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { User } from '@prisma/client';

interface DriversNearbyProps {
  formData: Partial<CreateOrderData>;
  drivers: User[] | null;
  page: number;
  perPage: number;
  total: number;
  changePage: (newPage: number) => void;
  isLoading: boolean;
  handleSearchDriver: (value: string) => void;
  searchDriver: string;
  handleDriverSelect: (driverId: string) => void;
}

const DriversNearby: React.FC<DriversNearbyProps> = ({
  formData,
  drivers,
  page,
  perPage,
  total,
  changePage,
  isLoading,
  handleSearchDriver,
  searchDriver,
  handleDriverSelect,
}) => {
  const handleSearchChange = useCallback(
    (value: string) => {
      handleSearchDriver(value);
    },
    [handleSearchDriver],
  );

  const handleDriverClick = useCallback(
    (driverId: string) => {
      handleDriverSelect(driverId);
    },
    [handleDriverSelect],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      changePage(newPage);
    },
    [changePage],
  );

  return (
    <>
      <div className="w-full h-full flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold leading-9">Водители поблизости</h1>
        <TextInput
          classNamePadding="text-5 font-light leading-5 p-5 rounded-3xl shadow-3xl"
          placeholder="Поиск по ФИО"
          value={searchDriver}
          onChange={handleSearchChange}
        />
        <AnimatedComponent className="w-full h-full bg-transparent rounded-lg">
          {isLoading ? null : !drivers || drivers.length === 0 ? (
            <NoData message="Нет доступных водителей" />
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse border border-[#0000001A] rounded-lg ">
                <tbody>
                  {drivers.map((driver) => {
                    const isSelected = formData.assignedDriverId === driver.uuid;
                    const isOnline = isDriverOnline(driver.lastActive);
                    return (
                      <tr
                        key={driver.uuid}
                        className={`relative flex p-4 gap-4 cursor-pointer border-b border-[#0000001A] hover:bg-[#00000005] last:border-b-0 w-full ${
                          isSelected ? 'bg-[#00ff0010] hover:bg-[#00ff0020]' : ''
                        }`}
                        onClick={() => handleDriverClick(driver.uuid)}
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
                              {isOnline ? 'Онлайн' : 'Офлайн'}
                            </span>
                            <p className="text-5 leading-5 font-medium">{driver.fullName}</p>
                            <p className="text-4 leading-4 font-light">{driver.phone}</p>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </AnimatedComponent>
      </div>
      {total > 0 && total > perPage && (
        <Pagination
          pageNumber={page}
          pageSize={perPage}
          totalCount={total}
          setPageNumber={handlePageChange}
        />
      )}
    </>
  );
};

export default DriversNearby;
