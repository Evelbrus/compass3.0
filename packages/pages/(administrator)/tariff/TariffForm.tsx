'use client';

import React, { useEffect, ChangeEvent } from 'react';
import { AdditionalService, ServiceLevels, VehicleType } from '@prisma/client';
import { IButton } from '@shared/components/ui/buttons';
import { useTariffForm, UseTariffFormProps } from '@features/tariffs/hooks/useTariffForm';
import { useTariffSubmit } from '@features/tariffs/hooks/useTariffSubmit';
import { SelectSingle, TextInput } from '@shared/components/ui/inputs';
import { SelectOption } from '@shared/lib/effector';

interface AdditionalServiceEntry {
  serviceUuid: string;
  price: number;
  isAvailable: boolean;
}

const TariffForm: React.FC<UseTariffFormProps> = ({ mode, initialData }) => {
  const {
    formData,
    handleInputChange,
    handleAddAdditionalService,
    handleRemoveAdditionalService,
    setFormData,
    additionalServices,
    handleLocalChange,
    handleFreeWaitTimeChange,
  } = useTariffForm({ mode });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData(initialData);
    }
  }, [mode, initialData, setFormData]);

  const { handleSubmit } = useTariffSubmit(
    {
      ...formData,
      tariffAdditionalServices: formData.tariffAdditionalServices.map((service) => ({
        ...service,
        uuid: '',
        service: {} as AdditionalService,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    },
    mode,
  );

  useEffect(() => {
    if (!formData) return;
    setFormData((prev) => ({ ...prev }));
  }, [formData?.tariffAdditionalServices]);

  const handleDelete = (serviceUuid: string) => {
    handleRemoveAdditionalService(serviceUuid);
  };

  const checkedAdditionalServices = additionalServices ?? [];
  const selectOptions: SelectOption<string>[] = checkedAdditionalServices
    .filter(
      (service) =>
        !formData.tariffAdditionalServices.some(
          (selected) => selected.serviceUuid === service.uuid,
        ),
    )
    .map((service) => ({ label: service.name, value: service.uuid }));

  const handleSelectChange = (option: SelectOption<string> | null) => {
    if (!option) return;

    if (formData.tariffAdditionalServices.some((service) => service.serviceUuid === option.value)) {
      return;
    }

    const newService: AdditionalServiceEntry = {
      serviceUuid: option.value,
      price: 0,
      isAvailable: true,
    };

    handleAddAdditionalService(newService);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {mode === 'create' ? 'Создать тариф' : 'Редактировать тариф'}
      </h1>
      <section className="flex flex-col justify-center bg-white rounded-md">
        <form
          onSubmit={handleSubmit}
          id="tariff-create-form"
          className="grid grid-cols-1 gap-x-8 gap-y-4 p-6"
        >
          <h4 className="text-lg font-bold text-gray-800">Основная информация</h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4">
            <div className="mb-4 col-span-1">
              <TextInput
                type="text"
                value={formData.name}
                label="Название тарифа:"
                onChange={(value) =>
                  handleInputChange({
                    target: { id: 'name', value, type: 'text' },
                  } as ChangeEvent<HTMLInputElement>)
                }
                placeholder="Введите название тарифа"
                required
              />
            </div>
            <div>
              <SelectSingle
                label="Тип автомобиля:"
                value={
                  formData.vehicleType
                    ? { value: formData.vehicleType, label: formData.vehicleType }
                    : null
                }
                onChange={(option) =>
                  setFormData({ ...formData, vehicleType: option?.value as VehicleType })
                }
                options={Object.values(VehicleType).map((type) => ({ value: type, label: type }))}
                requiredStar
              />
            </div>
            <div>
              <TextInput
                type="text"
                label="Описание тарифа:"
                value={formData.description || ''}
                maxLength={500}
                onChange={(value) =>
                  handleInputChange({
                    target: { id: 'description', value, type: 'text' },
                  } as ChangeEvent<HTMLInputElement>)
                }
                placeholder="Введите описание тарифа"
              />
            </div>
            <div>
              <TextInput
                type="number"
                label="Стоимость тарифа:"
                value={formData.price}
                onChange={(value) =>
                  handleInputChange({
                    target: { id: 'price', value, type: 'number' },
                  } as ChangeEvent<HTMLInputElement>)
                }
                required
                placeholder="Введите стоимость тарифа"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 md:grid-cols-2 gap-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <h4 className="text-lg font-bold text-gray-800">Тарифные параметры</h4>
              <div>
                <SelectSingle
                  label="Уровень обслуживания"
                  value={
                    formData.serviceLevel
                      ? { value: formData.serviceLevel, label: formData.serviceLevel }
                      : null
                  }
                  onChange={(option) =>
                    setFormData({ ...formData, serviceLevel: option?.value as ServiceLevels })
                  }
                  options={Object.values(ServiceLevels).map((level) => ({
                    value: level,
                    label: level,
                  }))}
                />
              </div>
              <div className="form-group flex items-center justify-between">
                <p className="text-4 font-medium text-gray-500">
                  Бесплатное время ожидания вне Аэропорта
                </p>

                <TextInput
                  type="number"
                  value={formData.freeWaitTimeBishkek}
                  onChange={(value) =>
                    handleInputChange({
                      target: {
                        id: 'freeWaitTimeBishkek',
                        value: handleFreeWaitTimeChange(value),
                        type: 'number',
                      },
                    } as unknown as ChangeEvent<HTMLInputElement>)
                  }
                  required
                />
              </div>
              <p className="text-4 font-medium text-gray-500">
                Стоимость за каждую минуты после бесплатного времени ожидания вне Аэропорта (сумма)
              </p>
              <div>
                <TextInput
                  type="number"
                  value={formData.pricePerMinuteAfterBishkek}
                  onChange={(value) =>
                    handleInputChange({
                      target: { id: 'pricePerMinuteAfterBishkek', value, type: 'number' },
                    } as ChangeEvent<HTMLInputElement>)
                  }
                  required
                  placeholder="цена за минуту после Бишкека"
                />
              </div>
              <div className="form-group flex items-center justify-between">
                <p className="text-4 font-medium text-gray-500">
                  Бесплатное время ожидания в аэропорту
                </p>

                <TextInput
                  type="number"
                  value={formData.freeWaitTimeAirport}
                  onChange={(value) =>
                    handleInputChange({
                      target: {
                        id: 'freeWaitTimeAirport',
                        value: handleFreeWaitTimeChange(value),
                        type: 'number',
                      },
                    } as unknown as ChangeEvent<HTMLInputElement>)
                  }
                  required
                />
              </div>
              <p className="text-4 font-medium text-gray-500">
                Стоимость за каждую минуты после бесплатного времени ожидания в Аэропорту (сумма)
              </p>
              <div>
                <TextInput
                  type="number"
                  value={formData.pricePerMinuteAfterAirport}
                  onChange={(value) =>
                    handleInputChange({
                      target: { id: 'pricePerMinuteAfterAirport', value, type: 'number' },
                    } as ChangeEvent<HTMLInputElement>)
                  }
                  required
                  placeholder="цена за минуту после аэропорта"
                />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-800 mb-4">Дополнительные услуги</h4>
              <div className="mb-4">
                <SelectSingle<string>
                  options={[...selectOptions]}
                  value={null}
                  onChange={handleSelectChange}
                  placeholder="Опции"
                  label="Выберите дополнительные услуги:"
                />
              </div>

              {formData.tariffAdditionalServices.length > 0 && (
                <div className="mt-4 space-y-4">
                  <h2 className="block text-4 font-medium text-gray-500 mb-2">Выбранные опции</h2>
                  {formData?.tariffAdditionalServices.map((service, index) => {
                    const serviceName =
                      additionalServices.find((s) => s.uuid === service.serviceUuid)?.name ||
                      'Unknown Service';
                    return (
                      <div
                        key={`${service.serviceUuid}-${index}`}
                        className="flex md:flex-row items-start md:items-center gap-4 rounded-md"
                      >
                        <div className="w-full md:w-1/3 font-medium">{serviceName}</div>

                        <div className="w-full flex md:w-1/3 gap-2">
                          <TextInput
                            type="number"
                            value={service.price}
                            onChange={(e) =>
                              handleLocalChange(index, {
                                target: { name: 'price', value: e },
                              } as ChangeEvent<HTMLInputElement>)
                            }
                            required
                          />
                          <p className="p-[12px] bg-black text-white w-[40px] flex items-center h-[40px] rounded-lg">
                            C
                          </p>
                          <button
                            className="p-[12px] bg-white text-red-600 w-[40px] flex items-center justify-center h-[40px] rounded-lg border"
                            onClick={() => handleDelete(service.serviceUuid)}
                          >
                            -
                          </button>
                        </div>

                        <div className="w-full md:w-1/3 hidden">
                          <label className="flex items-center gap-2">
                            <input
                              name="isAvailable"
                              type="checkbox"
                              checked={service.isAvailable}
                              onChange={(e) => handleLocalChange(index, e)}
                              className="w-[18px] h-[18px] bg-white rounded-md border border-gray-300 focus:bg-gray-100"
                            />
                            <span className="text-[#989898] text-[14px] font-normal">
                              Available
                            </span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="w-full flex justify-end">
            <IButton
              type="submit"
              form="tariff-create-form"
              className="w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
            >
              {mode === 'create' ? 'Создать тариф' : 'Сохранить изменения'}
            </IButton>
          </div>
        </form>
      </section>
    </div>
  );
};

export default TariffForm;
