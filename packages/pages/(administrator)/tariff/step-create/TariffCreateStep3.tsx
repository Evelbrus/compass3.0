import React, { ChangeEvent } from 'react';
import { AdditionalService } from '@prisma/client';
import { TextInput } from '@shared/components/ui/inputs';
interface TariffCreateStep3Props {
  formData: {
    tariffAdditionalServices: {
      serviceUuid: string;
      price: number;
      isAvailable: boolean;
    }[];
  };
  additionalServices: AdditionalService[];
  handleAdditionalServicesChange: (index: number, event: ChangeEvent<HTMLInputElement>) => void; // Изменили сигнатуру
}

const TariffCreateStep3: React.FC<TariffCreateStep3Props> = ({
  formData,
  additionalServices,
  handleAdditionalServicesChange,
}) => {
  return (
    <div className="p-4 bg-white border-t border-gray-300 grid grid-cols-2">
      {formData.tariffAdditionalServices.map((additionalService, index) => {
        const serviceName =
          additionalServices.find((service) => service.uuid === additionalService.serviceUuid)
            ?.name || 'Unknown Service';

        return (
          <div key={index} className="mb-4">
            <div className="flex items-center gap-[12px]">
              <TextInput
                type="number"
                label={serviceName}
                value={additionalService.price}
                onChange={(e) =>
                  handleAdditionalServicesChange(index, {
                    target: { name: 'price', value: e },
                  } as ChangeEvent<HTMLInputElement>)
                }
                required
              />

              <label className="flex items-center gap-[5px] text-[#989898] text-[14px] font-normal leading-[13.93px] mt-[30px]">
                <input
                  name="isAvailable"
                  type="checkbox"
                  checked={additionalService.isAvailable}
                  className="w-[18px] h-[18px] bg-white px-3 py-2 rounded-md border border-gray-300 focus:bg-gray-100"
                  onChange={(e) =>
                    handleAdditionalServicesChange(index, e as ChangeEvent<HTMLInputElement>)
                  }
                />
                Available
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TariffCreateStep3;
