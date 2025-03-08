import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextInput, CheckboxInput } from '@shared/components/ui/inputs';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { AdditionalService } from '@prisma/client';

interface TariffAdditionalService {
  serviceUuid: string;
  price: number;
  isAvailable: boolean;
}

interface TariffAdditionalServicesProps {
  additionalServices: AdditionalService[];
  handleAddAdditionalService: (service: TariffAdditionalService) => void;
  handleRemoveAdditionalService: (serviceUuid: string) => void;
  handleLocalChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TariffAdditionalServices: React.FC<TariffAdditionalServicesProps> = ({
  additionalServices,
  handleAddAdditionalService,
  handleRemoveAdditionalService,
  handleLocalChange,
}) => {
  const { control, watch, clearErrors } = useFormContext();

  // Получаем данные из контекста формы
  const tariffAdditionalServices = watch('tariffAdditionalServices') || [];

  // Создаем список ID сервисов, которые уже добавлены
  const selectedServiceIds = tariffAdditionalServices.map((service: TariffAdditionalService) => service.serviceUuid);

  // Обработчик изменения чекбокса
  const handleCheckboxChange = (service: AdditionalService, isChecked: boolean) => {
    if (isChecked) {
      // Добавляем сервис
      const tariffAdditionalService: TariffAdditionalService = {
        serviceUuid: service.uuid,
        price: 0, // Начальная цена
        isAvailable: true,
      };
      handleAddAdditionalService(tariffAdditionalService);
    } else {
      // Удаляем сервис
      handleRemoveAdditionalService(service.uuid);
    }
  };

  // Получаем индекс услуги в массиве tariffAdditionalServices
  const getServiceIndex = (serviceUuid: string) => {
    return tariffAdditionalServices.findIndex(
      (service: TariffAdditionalService) => service.serviceUuid === serviceUuid
    );
  };

  return (
    <AnimatedComponent duration={300}>
      <div className="w-full flex flex-col">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center p-6 border-b">
              Дополнительные услуги
            </h3>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Выберите дополнительные услуги, которые будут доступны в данном тарифе, и установите цену для каждой услуги.
                </p>
              </div>

              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="w-16 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Выбор
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Название услуги
                      </th>
                      <th scope="col" className="w-1/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Цена
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {additionalServices.map((service) => {
                      const isSelected = selectedServiceIds.includes(service.uuid);
                      const serviceIndex = getServiceIndex(service.uuid);

                      return (
                        <tr
                          key={service.uuid}
                          className={`${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <CheckboxInput
                              label=""
                              checked={isSelected}
                              onChange={(e) => handleCheckboxChange(service, e.target.checked)}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isSelected && (
                              <Controller
                                name={`tariffAdditionalServices[${serviceIndex}].price`}
                                control={control}
                                rules={{ required: 'Цена обязательна' }}
                                render={({ field, fieldState }) => (
                                  <TextInput
                                    type="number"
                                    placeholder="Введите стоимость"
                                    value={field.value || 0}
                                    onChange={(e) => {
                                      if (e !== null) {
                                        field.onChange(e);
                                        handleLocalChange(serviceIndex, {
                                          target: {
                                            name: 'price',
                                            value: e.toString(),
                                          },
                                        } as React.ChangeEvent<HTMLInputElement>);
                                        clearErrors(`tariffAdditionalServices[${serviceIndex}].price`);
                                      }
                                    }}
                                    onFocus={() => clearErrors(`tariffAdditionalServices[${serviceIndex}].price`)}
                                    required
                                    error={!!fieldState.error}
                                    message={fieldState.error?.message}
                                  />
                                )}
                              />
                            )}
                            {!isSelected && (
                              <div className="text-sm text-gray-500">-</div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {additionalServices.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                          В системе нет дополнительных услуг
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {additionalServices.length > 0 && selectedServiceIds.length === 0 && (
                <div className="mt-4 text-sm text-gray-500 text-center">
                  Выберите услуги, которые будут доступны в этом тарифе
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AnimatedComponent>
  );
};

export default TariffAdditionalServices;