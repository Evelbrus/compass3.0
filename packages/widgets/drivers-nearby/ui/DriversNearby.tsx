import React from 'react';
import NoData from '@shared/components/errors/noData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import Pagination from '@shared/components/ui/pagination/Pagination';
import { TextInput } from '@shared/components/ui/inputs';
import { LazyImage } from '@shared/components/ui/images';
import { isDriverOnline } from '@widgets/drivers-nearby/fucntions/isDriverOnline';
import { User } from '@prisma/client';
import { countryData } from '@shared/components/ui/inputs/phone';
import {
  serviceLevelOptions,
  vehicleTypeOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';

// Расширяем тип User, добавляя вложенную информацию о транспорте
interface DriverWithVehicle extends User {
  vehicleDriver?: {
    vehicle?: {
      plateNumber: string;
      vehicleType: string;
      serviceLevels: string;
    };
  };
}

type SafeUser = Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'profilePhotoPath'>;

interface DriversNearbyProps {
  drivers: DriverWithVehicle[];
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

  // Функция для форматирования номера телефона согласно паттерну
  const formatPhoneNumber = (value: string, formatPattern: number[]): string => {
    const digits = value.replace(/\D/g, '');
    let formatted = '';
    let index = 0;
    formatPattern.forEach((groupLength) => {
      if (digits.length > index) {
        const group = digits.substring(index, index + groupLength);
        formatted += group;
        index += groupLength;
        if (index < digits.length) {
          formatted += ' ';
        }
      }
    });
    return formatted;
  };

  // Находит страну по началу номера (dialCode)
  const getCountryByDialCode = (phone: string) => {
    return countryData.find((country) => phone.startsWith(country.dialCode));
  };

  // Возвращает JSX-элемент с флагом и отформатированным номером телефона
  const getFormattedPhone = (phone: string) => {
    const country = getCountryByDialCode(phone);
    if (!country) {
      return <span>{phone}</span>;
    }
    const { dialCode, flag, formatPattern, name } = country;
    const numberWithoutDial = phone.startsWith(dialCode) ? phone.slice(dialCode.length) : phone;
    const formattedNumber = formatPhoneNumber(numberWithoutDial, formatPattern);
    return (
      <span className="flex items-center">
        <LazyImage src={flag} alt={name} className="w-[20px] h-[20px] mr-1" />
        <span>
          {dialCode} {formattedNumber}
        </span>
      </span>
    );
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h1 className="text-2xl font-extrabold leading-9">Водители поблизости</h1>
      <TextInput
        inputClass="text-base font-light leading-5 p-5 rounded-lg shadow-md border"
        placeholder="Поиск по ФИО либо Номер автомобиля"
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
        classNameLabel="bg-white"
      />
      <AnimatedComponent className="w-full h-full bg-white rounded-lg border shadow-lg">
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
                  const userImageSrc = driver.profilePhotoPath
                    ? `/api/images/${driver.profilePhotoPath.split('/').pop()}?type=avatar`
                    : null;

                  // Получаем переведённое значение для типа авто и уровня обслуживания
                  const vehicleTypeRaw = driver.vehicleDriver?.vehicle?.vehicleType;
                  const serviceLevelRaw = driver.vehicleDriver?.vehicle?.serviceLevels;
                  const vehicleTypeLabel = vehicleTypeRaw
                    ? vehicleTypeOptions.find((option) => option.value === vehicleTypeRaw)?.label ||
                      vehicleTypeRaw
                    : '—';
                  const serviceLevelLabel = serviceLevelRaw
                    ? serviceLevelOptions.find((option) => option.value === serviceLevelRaw)
                        ?.label || serviceLevelRaw
                    : '—';

                  return (
                    <tr
                      key={driver.uuid}
                      className={`relative flex flex-row p-4 gap-4 cursor-pointer border-b border-[#0000001A] hover:bg-gray-100 last:border-b-0 w-full ${
                        isSelected ? 'bg-blue-100' : ''
                      }`}
                      onClick={() => handleDriverClick(driver.uuid)}
                    >
                      {/* Avatar и информация о водителе */}
                      <td className="flex flex-row gap-4 items-center w-full">
                        <div className="relative w-[50px] h-[50px] flex-shrink-0">
                          <LazyImage
                            src={userImageSrc || '/icons/user-driver.svg'}
                            alt="Driver Avatar"
                            className="w-[50px] h-[50px] rounded-full object-cover bg-white border"
                          />
                          <div
                            className={`absolute top-0 left-0 w-4 h-4 rounded-full border-2 ${
                              isOnline ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                        <div className="flex flex-row gap-1 flex-grow">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`absolute top-0 left-1/3 text-sm leading-3 font-medium ${
                                isOnline ? 'text-green-500' : 'text-red-500'
                              }`}
                            >
                              {isOnline ? 'В сети' : 'Не в сети'}
                            </span>
                            <p className="w-[150px] text-base leading-5 font-medium">
                              {driver.fullName}
                            </p>
                            <div className="text-sm leading-4 font-light">
                              {getFormattedPhone(driver.phone)}
                            </div>
                          </div>
                          <div className="flex flex-col items-start">
                            <p className="text-sm">
                              {driver.vehicleDriver?.vehicle?.plateNumber || '—'}
                            </p>
                            <p className="text-sm">
                              {vehicleTypeLabel} - {serviceLevelLabel}
                            </p>
                          </div>
                        </div>
                        {/* Зеленый оверлей для выбранного водителя */}
                        {isSelected && (
                          <div
                            className="absolute top-0 right-0 h-full pointer-events-none"
                            style={{
                              width: '20%',
                              backgroundColor: 'rgba(34,197,94,0.2)',
                              zIndex: 1,
                            }}
                          />
                        )}
                      </td>
                      {/* Кнопки */}
                      <td className="flex flex-col items-center gap-2 relative z-10 flex-shrink-0">
                        <button
                          type="button"
                          className="hover:bg-gray-200 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Действие для просмотра (пока пустое)
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="hover:bg-gray-200 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Действие для написания сообщения (пока пустое)
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AnimatedComponent>
      <Pagination
        pageNumber={page}
        pageSize={perPage}
        totalCount={currentTotal}
        setPageNumber={handlePageChange}
      />
    </div>
  );
};

export default DriversNearby;
