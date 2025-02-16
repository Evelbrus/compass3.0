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
  const handleFreeWaitTimeChange = (value: string | number) => {
    const numberValue = Number(value);
    return numberValue <= 60 ? numberValue : 60;
  };

  return (
    <div className="grid grid-cols-1 gap-4 w-1/2">
      <div>
        <TextInput
          type="number"
          label="Фиксированая Цена за Каждую Дополнительную точку в поездку"
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
        <p className="text-4 font-medium text-gray-500">Бесплатное время ожидания вне Аэропорта</p>

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
        <p className="text-4 font-medium text-gray-500">Бесплатное время ожидания в аэропорту</p>

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
  );
};
export default TariffCreateStep2;
