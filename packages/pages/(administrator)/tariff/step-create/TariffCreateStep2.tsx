import React, { ChangeEvent } from 'react';
import { ServiceLevels } from '@prisma/client';
import { SelectSingle, TextInput } from '@shared/components/ui/inputs';

interface TariffCreateStep2Props {
  formData: {
    additionalPointPrice: number;
    freeWaitTimeBishkek: number;
    pricePerMinuteAfterBishkek: number;
    freeWaitTimeAirport: number;
    pricePerMinuteAfterAirport: number;
    serviceLevel?: ServiceLevels;
  };
  handleInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFormData: (data: any) => void;
}

const TariffCreateStep2: React.FC<TariffCreateStep2Props> = ({
  formData,
  setFormData,
  handleInputChange,
}) => {
  return (
    <div className='grid grid-cols-2 gap-4'>
      <div>
        <TextInput
          type="number"
          label="Additional Point Price:"
          value={formData.additionalPointPrice}
          onChange={(value) =>
            handleInputChange({
              target: { id: 'additionalPointPrice', value, type: 'number' },
            } as ChangeEvent<HTMLInputElement>)
          }
          required
        />
      </div>
      <div>
        <TextInput
          type="number"
          label="Free Wait Time Bishkek:"
          value={formData.freeWaitTimeBishkek}
          onChange={(value) =>
            handleInputChange({
              target: { id: 'freeWaitTimeBishkek', value, type: 'number' },
            } as ChangeEvent<HTMLInputElement>)
          }
          required
        />
      </div>
      <div>
        <TextInput
          type="number"
          label="Price Per Minute After Bishkek:"
          value={formData.pricePerMinuteAfterBishkek}
          onChange={(value) =>
            handleInputChange({
              target: { id: 'pricePerMinuteAfterBishkek', value, type: 'number' },
            } as ChangeEvent<HTMLInputElement>)
          }
          required
        />
      </div>
      <div>
        <TextInput
          type="number"
          label="Free Wait Time Airport:"
          value={formData.freeWaitTimeAirport}
          onChange={(value) =>
            handleInputChange({
              target: { id: 'freeWaitTimeAirport', value, type: 'number' },
            } as ChangeEvent<HTMLInputElement>)
          }
          required
        />
      </div>
      <div>
        <TextInput
          type="number"
          label="Price Per Minute After Airport:"
          value={formData.pricePerMinuteAfterAirport}
          onChange={(value) =>
            handleInputChange({
              target: { id: 'pricePerMinuteAfterAirport', value, type: 'number' },
            } as ChangeEvent<HTMLInputElement>)
          }
          required
        />
      </div>
      <div>
        <SelectSingle
          label="Service Level:"
          classNameLabel="block text-4 font-medium text-gray-500 mb-2"
          className="w-full bg-white rounded-md border border-gray-300 focus:bg-gray-100 text-4 text-[#2A3037] font-extrabold"
          classNamePadding="py-[7px] px-[12px]"
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
    </div>
  );
};
export default TariffCreateStep2;
