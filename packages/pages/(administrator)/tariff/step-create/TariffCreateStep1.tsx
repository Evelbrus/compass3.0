import React, { ChangeEvent } from 'react';
import { VehicleType } from '@prisma/client';
import { SelectSingle, TextInput } from '@shared/components/ui/inputs';

interface TariffCreateStep1Props {
  formData: {
    name: string;
    vehicleType: VehicleType | undefined;
    description: string | null;
    price: number;
  };
  handleInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFormData: (data: any) => void;
}

const TariffCreateStep1: React.FC<TariffCreateStep1Props> = ({
  formData,
  setFormData,
  handleInputChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="mb-4 col-span-1">
        <TextInput
          type="text"
          value={formData.name}
          label="Name:"
          onChange={(value) =>
            handleInputChange({
              target: { id: 'name', value, type: 'text' },
            } as ChangeEvent<HTMLInputElement>)
          }
          placeholder="tariff name"
          required
        />
      </div>
      <div>
        <SelectSingle
          label="Vehicle Type:"
          value={
            formData.vehicleType
              ? { value: formData.vehicleType, label: formData.vehicleType }
              : null
          }
          onChange={(option) =>
            setFormData({ ...formData, vehicleType: option?.value as VehicleType })
          }
          options={Object.values(VehicleType).map((type) => ({
            value: type,
            label: type,
          }))}
        />
      </div>
      <div>
        <TextInput
          type="text"
          label="Description:"
          value={formData.description || ''}
          maxLength={500}
          onChange={(value) =>
            handleInputChange({
              target: { id: 'description', value, type: 'text' },
            } as ChangeEvent<HTMLInputElement>)
          }
          placeholder="description"
        />
      </div>
      <div>
        <TextInput
          type="number"
          label="Price:"
          value={formData.price}
          onChange={(value) =>
            handleInputChange({
              target: { id: 'price', value, type: 'number' },
            } as ChangeEvent<HTMLInputElement>)
          }
          required
        />
      </div>
    </div>
  );
};
export default TariffCreateStep1;
