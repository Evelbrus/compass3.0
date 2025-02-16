import React, { useState, useEffect } from 'react';
import { Controller, useFormContext, useFieldArray } from 'react-hook-form';
import { CheckboxInput, SelectSingle, TextInput } from '@shared/components/ui/inputs';
import { AdditionalService } from '@prisma/client';
import { SelectOption } from '@shared/lib/effector';

interface TariffEditProps {
  data: {
    tariffAdditionalServices: Array<{
      service: { uuid: string; name: string };
      price: number;
      isAvailable: boolean;
    }>;
  };
  additionalServices: AdditionalService[];
}

const TariffEditStep3: React.FC<TariffEditProps> = ({ data, additionalServices }) => {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    name: 'tariffAdditionalServices',
    control,
  });

  const [availableServices, setAvailableServices] = useState<SelectOption<string>[]>([]);
  const [removedServices, setRemovedServices] = useState<SelectOption<string>[]>([]);

  useEffect(() => {
    const selectOptions: SelectOption<string>[] = additionalServices
      .filter(
        (service) =>
          !data.tariffAdditionalServices.some((selected) => selected.service.uuid === service.uuid),
      )
      .map((service) => ({
        label: service.name,
        value: service.uuid,
      }));

    setAvailableServices(selectOptions);
  }, [additionalServices, data.tariffAdditionalServices]);

  const handleSelectChange = (option: SelectOption<string> | null) => {
    if (!option) return;

    const isAlreadyAdded = fields.some((field) => field.id === option.value);
    if (isAlreadyAdded) return;

    const isRemoved = removedServices.some((service) => service.value === option.value);
    if (isRemoved) {
      setRemovedServices((prev) => prev.filter((service) => service.value !== option.value));
    }

    append({
      serviceUuid: option.value,
      price: 0,
      isAvailable: true,
    });

    setAvailableServices((prevOptions) => prevOptions.filter((opt) => opt.value !== option.value));
  };

  const handleRemoveService = (index: number, serviceUuid: string) => {
    remove(index);

    const removedService = additionalServices.find((service) => service.uuid === serviceUuid);
    if (removedService) {
      setRemovedServices((prev) => [
        ...prev,
        {
          label: removedService.name,
          value: removedService.uuid,
        },
      ]);
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-300">
      <div className="mb-4 w-1/2">
        <SelectSingle<string>
          options={[...availableServices, ...removedServices]}
          value={null}
          onChange={handleSelectChange}
          placeholder="Опции"
        />
      </div>
      <h2 className="block text-4 font-medium text-gray-500 mb-2">Выбранные опции</h2>

      {fields.map((service, index) => {
        const serviceUuid = watch(`tariffAdditionalServices.${index}.serviceUuid`);
        const selectedService = additionalServices.find((item) => item.uuid === serviceUuid);
        const serviceName = selectedService ? selectedService.name : '';
        return (
          <div
            key={service.id}
            className="flex md:flex-row items-start md:items-center gap-4 rounded-md w-1/2 mb-2"
          >
            <p className="w-full md:w-1/3 font-medium">{serviceName}</p>
            <div className="w-full flex md:w-1/3 gap-2">
              <Controller
                name={`tariffAdditionalServices.${index}.price`}
                control={control}
                render={({ field }) => (
                  <TextInput {...field} placeholder="Enter price" type="number" />
                )}
              />
              <p className="p-[12px] bg-black text-white w-[40px] flex items-center h-[40px] rounded-lg">
                C
              </p>
              <button
                type="button"
                className="p-[12px] bg-white text-red-600 w-[40px] flex items-center justify-center h-[40px] rounded-lg border"
                onClick={() => handleRemoveService(index, serviceUuid)}
              >
                -
              </button>
            </div>
            <div className="mt-[30px] hidden">
              <Controller
                name={`tariffAdditionalServices.${index}.isAvailable`}
                control={control}
                render={({ field }) => (
                  <CheckboxInput {...field} label="Available" checked={field.value} />
                )}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TariffEditStep3;
