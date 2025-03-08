// VehicleDriversAssignment.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { VehicleData } from '@features/vehicles/hooks/create/useVehiclesCreateForm';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';

type VehicleDriversAssignmentProps = {
  drivers: User[];
  onSelectDriver: (driver: User) => void;
  onRemoveDriver: (uuid: string) => void;
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  observerRef: React.RefObject<HTMLDivElement>;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
};

export const VehicleDriversAssignment: React.FC<VehicleDriversAssignmentProps> = ({
  drivers,
  onSelectDriver,
  onRemoveDriver,
  searchTerm,
  handleSearchChange,
  observerRef,
  scrollContainerRef,
}) => {
  const { watch } = useFormContext<VehicleData>();
  const router = useRouter();

  const handleViewDriver = (driverUuid: string) => {
    router.push(`/user/detail/${driverUuid}`);
  };

  return (
    <div className="overflow-hidden">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              className="w-5 h-5 text-blue-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            Назначение водителей
          </h3>
          <p className="mb-5 text-sm text-gray-600">
            Назначьте водителей на этот автомобиль. Вы можете выбрать нескольких водителей, которые
            смогут управлять этим транспортным средством.
          </p>

          {/* Используем flex-row для размещения контейнеров рядом */}
          <div className="flex flex-row md:flex-row gap-6">
            {/* Левая колонка - Список доступных водителей */}
            <div className="bg-white border border-gray-200 rounded-lg flex-1">
              <div className="p-4 h-full flex flex-col">
                <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                    />
                  </svg>
                  Доступные водители
                </h4>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-300 focus:border-indigo-300 sm:text-sm"
                    placeholder="Поиск водителей..."
                  />
                </div>
                <div
                  ref={scrollContainerRef}
                  className="mt-3 h-96 overflow-y-auto border border-gray-200 rounded-md bg-white flex-grow"
                >
                  {drivers.length > 0 ? (
                    drivers.map((driver) => (
                      <div
                        key={driver.uuid}
                        className="p-3 hover:bg-blue-50 border-b border-gray-200"
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => onSelectDriver(driver)}
                          >
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                              {driver.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{driver.fullName}</p>
                              <p className="text-xs text-gray-500">{driver.email}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 p-1"
                            onClick={() => handleViewDriver(driver.uuid)}
                            title="Просмотреть детали водителя"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      {searchTerm ? 'Водители не найдены' : 'Список водителей пуст'}
                    </div>
                  )}
                  <div ref={observerRef} className="p-2 text-center" />
                </div>
              </div>
            </div>

            {/* Правая колонка - Таблица назначенных водителей */}
            <div className="bg-white border border-gray-200 rounded-lg flex-1">
              <div className="p-4 h-full flex flex-col">
                <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Назначенные водители
                </h4>

                <div className="border border-gray-200 rounded-md h-96 flex-grow overflow-hidden flex flex-col">
                  {watch('vehicleDrivers')?.length > 0 ? (
                    <div className="overflow-y-auto flex-grow">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-full"
                            >
                              Водитель
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Действия
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {watch('vehicleDrivers').map((assignment) => (
                            <tr key={assignment.driver.uuid} className="hover:bg-gray-50">
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div className="flex items-center space-x-3">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                    {assignment.driver.fullName.charAt(0)}
                                  </div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {assignment.driver.fullName}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-center">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    type="button"
                                    className="text-blue-600 hover:text-blue-800"
                                    onClick={() => handleViewDriver(assignment.driver.uuid)}
                                    title="Просмотреть детали водителя"
                                  >
                                    <svg
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    type="button"
                                    className="text-red-600 hover:text-red-800"
                                    onClick={() => onRemoveDriver(assignment.driver.uuid)}
                                    title="Удалить водителя"
                                  >
                                    <svg
                                      className="h-5 w-5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-6 text-center flex flex-col items-center justify-center h-full">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Водители еще не назначены</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Выберите водителей из списка слева
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
