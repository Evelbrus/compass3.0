'use client';

import React, { useState, useRef } from 'react';
import { User, Vehicle, VehicleDriver } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import { TextInput } from '@shared/components/ui/inputs';
import { handleTabChange } from '@shared/lib/navigation/handleTabChange';
import FormTabs, { TabItem } from '@widgets/navigations/tabs/FormTabs';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import {
  colorOptions,
  ownershipOptions,
  vehicleTypeOptions,
  vehicleSeats,
  serviceLevelOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';

export interface VehiclesDetailProps {
  data: Vehicle & {
    vehicleDrivers: (VehicleDriver & { driver: Omit<User, 'password' | 'refreshTokens'> })[];
  };
}

const VehiclesDetail: React.FC<VehiclesDetailProps> = ({ data }) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const tabs: TabItem[] = [
    { id: 'vehicle', label: 'Информация о транспортном средстве' },
    { id: 'drivers', label: 'Назначенные водители' },
  ];

  const [activeTab, setActiveTab] = useState('vehicle');

  const onTabChange = (tabId: string) => {
    handleTabChange({ setActiveTab }, tabId, activeTab, scrollRef, false);
  };

  // Функции для получения переведенных значений
  const getTranslatedColor = (color: string) => {
    const option = colorOptions.find((option) => option.value === color);
    return option ? option.label : color;
  };

  const getTranslatedVehicleType = (type: string) => {
    const option = vehicleTypeOptions.find((option) => option.value === type);
    return option ? option.label : type;
  };

  const getTranslatedOwnership = (ownership: string) => {
    const option = ownershipOptions.find((option) => option.value === ownership);
    return option ? option.label : ownership;
  };

  // Получение количества мест на основе типа ТС
  const getVehicleSeats = (type: string) => {
    return vehicleSeats[type as keyof typeof vehicleSeats] || 'Неизвестно';
  };

  const vehicleIdentificationDetails = [
    { label: 'Номерной знак', value: data.plateNumber },
    { label: 'Статус', value: data.isAvailable ? 'Доступен' : 'Недоступен' },
  ];

  // Получаем уровень обслуживания
  const getServiceLevel = () => {
    if (!data.serviceLevels) return 'Не указано';
    const option = serviceLevelOptions.find((option) => option.value === data.serviceLevels);
    return option ? option.label : data.serviceLevels;
  };

  // Группы характеристик в нужном порядке
  const vehicleTypeAndService = [
    { label: 'Тип', value: getTranslatedVehicleType(data.vehicleType) },
    { label: 'Уровень обслуживания', value: getServiceLevel() },
  ];

  const brandAndModel = [
    { label: 'Марка', value: data.brand },
    { label: 'Модель', value: data.model },
  ];

  const yearAndColor = [
    {
      label: 'Год выпуска',
      value: data.year ? new Date(data.year).getFullYear().toString() : 'Не указано',
    },
    { label: 'Цвет', value: getTranslatedColor(data.color) },
  ];

  const seatsAndOwnership = [
    { label: 'Пассажирские места', value: getVehicleSeats(data.vehicleType) },
    { label: 'Владение', value: getTranslatedOwnership(data.ownership) },
  ];

  const imageSrc = data.photoPath
    ? `/api/images/${data.photoPath.split('/').pop()}?type=vehicle`
    : null;

  const handleEdit = () => {
    router.push(`/transfer-services/edit/${data.uuid}`);
  };

  const noop = () => {};

  return (
    <AnimatedComponent duration={300}>
      <div className="w-full flex flex-col px-5">
        <div className="flex items-center justify-end">
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Редактировать
          </button>
        </div>

        <div ref={scrollRef}>
          <FormTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        {/* Информация о транспортном средстве */}
        {activeTab === 'vehicle' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="flex flex-row border-b border-gray-100">
              <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Фото транспорта</h3>
                <div className="flex flex-col items-center">
                  <AnimatedComponent duration={500} className="w-full">
                    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[400px]">
                      {imageSrc ? (
                        <ImageUploadWithCrop
                          initialImage={imageSrc}
                          mode="gallery"
                          aspect={4 / 3}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg
                            className="w-16 h-16 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1"
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </AnimatedComponent>
                  <p className="text-xs text-gray-500 mt-3">Изображение транспортного средства</p>
                </div>
              </div>

              <div className="w-2/3 p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {vehicleIdentificationDetails.map((item, index) => (
                      <TextInput
                        key={`id-${index}`}
                        label={item.label}
                        value={item.value ?? 'Не указано'}
                        onChange={noop}
                        readOnly={true}
                        inputClass="bg-gray-50 font-medium"
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {vehicleTypeAndService.map((item, index) => (
                      <TextInput
                        key={`type-${index}`}
                        label={item.label}
                        value={item.value ?? 'Не указано'}
                        onChange={noop}
                        readOnly={true}
                        inputClass="bg-gray-50 font-medium"
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {brandAndModel.map((item, index) => (
                      <TextInput
                        key={`brand-${index}`}
                        label={item.label}
                        value={item.value ?? 'Не указано'}
                        onChange={noop}
                        readOnly={true}
                        inputClass="bg-gray-50 font-medium"
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {yearAndColor.map((item, index) => (
                      <TextInput
                        key={`year-${index}`}
                        label={item.label}
                        value={item.value ?? 'Не указано'}
                        onChange={noop}
                        readOnly={true}
                        inputClass="bg-gray-50 font-medium"
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {seatsAndOwnership.map((item, index) => (
                      <TextInput
                        key={`seats-${index}`}
                        label={item.label}
                        value={item.value ?? 'Не указано'}
                        onChange={noop}
                        readOnly={true}
                        inputClass="bg-gray-50 font-medium"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Назначенные водители */}
        {activeTab === 'drivers' && (
          <AnimatedComponent duration={300}>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Назначенные водители</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {data.vehicleDrivers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Водитель
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Действия
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data.vehicleDrivers.map((assignment) => (
                            <tr key={assignment.driver.uuid} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                    {assignment.driver.fullName.charAt(0)}
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">
                                      {assignment.driver.fullName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {assignment.driver.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() =>
                                    router.push(`/user/detail/${assignment.driver.uuid}`)
                                  }
                                  className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                  <svg
                                    className="w-4 h-4 mr-1"
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
                                  Просмотреть
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-base text-gray-500 mb-1">Водители еще не назначены</p>
                      <p className="text-sm text-gray-400">
                        Вы можете назначить водителей для этого транспортного средства в режиме
                        редактирования
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </AnimatedComponent>
        )}
      </div>
    </AnimatedComponent>
  );
};

export default VehiclesDetail;
