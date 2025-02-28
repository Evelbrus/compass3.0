import React from 'react';
import NoData from '@shared/components/errors/noData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import Pagination from '@shared/components/ui/pagination/Pagination';
import { TextInput } from '@shared/components/ui/inputs';
import { LazyImage } from '@shared/components/ui/images';
import { isDriverOnline } from '@widgets/drivers-nearby/fucntions/isDriverOnline';
import { User } from '@prisma/client';

type SafeUser = Pick<User, 'uuid' | 'fullName' | 'email' | 'phone'>;

interface DriversNearbyProps {
  drivers: User[];
  isDriversLoading: boolean;
  searchDriver: string;
  handleSearchDriverChange: (value: string) => void;
  selectedDriverInfo: SafeUser | null;
  handleDriverClick: (driverId: string) => void;
  page: number;
  perPage: number;
  currentTotal: number;
  handlePageChange: (newPage: number) => void;
  serverTime: Date;
}

const DriversNearby: React.FC<DriversNearbyProps> = ({
  drivers,
  isDriversLoading,
  searchDriver,
  handleSearchDriverChange,
  selectedDriverInfo,
  handleDriverClick,
  page,
  perPage,
  currentTotal,
  handlePageChange,
  serverTime,
}) => {
  const serverTimeISO = serverTime.toISOString();

  return (
    <div className="w-full h-full flex flex-col gap-4 ">
      <h1 className="text-2xl font-extrabold leading-9">Водители поблизости</h1>
      <TextInput
        inputClass="text-base font-light leading-5 p-5 rounded-3xl shadow-3xl border"
        placeholder="Поиск по ФИО"
        value={searchDriver}
        onChange={(value) => {
          if (value === null) {
            handleSearchDriverChange('');
          } else if (typeof value === 'string') {
            handleSearchDriverChange(value);
          } else {
            console.warn('TextInput вернул число или bigint. Ожидалась строка для поиска по ФИО.');
          }
        }}
        classNameLabel={'bg-white'}
      />
      <AnimatedComponent className="w-full h-full bg-white rounded-lg border">
        {isDriversLoading ? (
          <div className="text-center text-gray-500">Загрузка...</div>
        ) : !drivers || drivers.length === 0 ? (
          <NoData message="Нет доступных водителей" />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse rounded-md bg-white border-[#0000001A]">
              <tbody>
                {drivers.map((driver) => {
                  const isSelected = selectedDriverInfo?.uuid === driver.uuid;
                  const isOnline = isDriverOnline(driver.lastActive, serverTimeISO);
                  return (
                    <tr
                      key={driver.uuid}
                      className={`relative flex p-4 gap-4 cursor-pointer border-b border-[#0000001A] hover:bg-gray-100 last:border-b-0 w-full ${
                        isSelected ? 'bg-blue-100' : ''
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
                            className={`absolute top-1 left-1/2 text-sm leading-3 font-medium self-start ${
                              isOnline ? 'text-green-500' : 'text-red-500'
                            }`}
                          >
                            {isOnline ? 'В сети' : 'Не в сети'}
                          </span>
                          <p className="text-base leading-5 font-medium">{driver.fullName}</p>
                          <p className="text-sm leading-4 font-light">{driver.phone}</p>
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
      {currentTotal > perPage && (
        <Pagination
          pageNumber={page}
          pageSize={perPage}
          totalCount={currentTotal}
          setPageNumber={handlePageChange}
        />
      )}
    </div>
  );
};

export default DriversNearby;
