import React, { ChangeEvent, useState } from 'react';
import { AdditionalService } from '@prisma/client';
import { SelectSingle, TextInput } from '@shared/components/ui/inputs';
import { SelectOption } from '@shared/lib/effector';

interface AdditionalServiceEntry {
  serviceUuid: string;
  price: number;
  isAvailable: boolean;
}

interface TariffCreateStep3Props {
  formData: {
    tariffAdditionalServices: AdditionalServiceEntry[];
  };
  additionalServices: AdditionalService[];
  handleAddAdditionalService: (service: AdditionalServiceEntry) => void;
  handleRemoveAdditionalService: (serviceUuid: string) => void;
}

const TariffCreateStep3: React.FC<TariffCreateStep3Props> = ({
  formData,
  additionalServices,
  handleAddAdditionalService,
  handleRemoveAdditionalService,
}) => {
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<
    AdditionalServiceEntry[]
  >([]);

  const selectOptions: SelectOption<string>[] = additionalServices.map((service) => ({
    label: service.name,
    value: service.uuid,
  }));

  const handleSelectChange = (option: SelectOption<string> | null) => {
    if (!option) return;

    if (selectedAdditionalServices.some((service) => service.serviceUuid === option.value)) {
      return;
    }

    const newService: AdditionalServiceEntry = {
      serviceUuid: option.value,
      price: 0,
      isAvailable: true,
    };

    setSelectedAdditionalServices((prev) => [...prev, newService]);
    handleAddAdditionalService(newService);
  };

  const handleLocalChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = event.target;

    setSelectedAdditionalServices((prev) => {
      const newServices = [...prev];
      if (name === 'price') {
        newServices[index].price = Number(value);
      } else if (name === 'isAvailable') {
        newServices[index].isAvailable = checked;
      }
      return newServices;
    });
  };

  const handleDelete = (serviceUuid: string) => {
    setSelectedAdditionalServices((prev) => prev.filter((s) => s.serviceUuid !== serviceUuid));
    handleRemoveAdditionalService(serviceUuid);
  };

  return (
    <div className="p-4 bg-white border-t border-gray-300">
      <div className="mb-4 w-1/2">
        <SelectSingle<string>
          options={selectOptions}
          value={null}
          onChange={handleSelectChange}
          placeholder="Опции"
        />
      </div>

      {formData.tariffAdditionalServices.length > 0 && (
        <div className="mt-4 space-y-4">
          <h2 className="block text-4 font-medium text-gray-500 mb-2">Выбранные опции</h2>
          {formData.tariffAdditionalServices.map((service, index) => {
            const serviceName =
              additionalServices.find((s) => s.uuid === service.serviceUuid)?.name ||
              'Unknown Service';
            return (
              <div
                key={`${service.serviceUuid}-${index}`}
                className="flex md:flex-row items-start md:items-center gap-4 rounded-md w-1/2"
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
                    <span className="text-[#989898] text-[14px] font-normal">Available</span>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TariffCreateStep3;
