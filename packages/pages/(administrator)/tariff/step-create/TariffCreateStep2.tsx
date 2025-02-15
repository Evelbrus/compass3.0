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

/**
 * Создаёт валидное событие, используя реальный HTMLInputElement.
 */
function createInputEvent(
  id: string,
  value: string,
  inputType: string,
): ChangeEvent<HTMLInputElement> {
  const input = document.createElement('input');
  input.id = id;
  input.type = inputType;
  input.value = value;
  return { target: input, currentTarget: input } as ChangeEvent<HTMLInputElement>;
}

/**
 * Приводит значение (string | number | bigint) к строке.
 * Если значение имеет тип bigint – сначала приводит к number.
 */
function toStringValue(value: string | number | bigint): string {
  if (typeof value === 'bigint') {
    return Number(value).toString();
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return value;
}

const TariffCreateStep2: React.FC<TariffCreateStep2Props> = ({
  formData,
  setFormData,
  handleInputChange,
}) => {
  //Ограничиваем значение до 60
  const handleFreeWaitTimeChange = (value: string | number): number => {
    const numberValue = Number(value);
    return numberValue <= 60 ? numberValue : 60;
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/*Additional Point Price */}
      <div>
        <TextInput
          type="number"
          label="Additional Point Price:"
          value={formData.additionalPointPrice}
          onChange={(value) => {
            //Если value окажется null, заменяем на 0;
            //если bigint – приводим к number.
            const safeValue = value === null ? 0 : value;
            const numericValue =
              typeof safeValue === 'bigint' ? Number(safeValue) : (safeValue as string | number);
            const eventValue = toStringValue(numericValue);
            handleInputChange(createInputEvent('additionalPointPrice', eventValue, 'number'));
          }}
          required
        />
      </div>

      {/*Free Wait Time Bishkek */}
      <div>
        <TextInput
          type="number"
          label="Free Wait Time Bishkek:"
          value={formData.freeWaitTimeBishkek}
          onChange={(value) => {
            //Используем null-слияние и явное приведение
            const rawValue = (value ?? 0) as string | number;
            const processed = handleFreeWaitTimeChange(rawValue);
            const eventValue = toStringValue(processed);
            handleInputChange(createInputEvent('freeWaitTimeBishkek', eventValue, 'number'));
          }}
          required
        />
      </div>

      {/*Price Per Minute After Bishkek */}
      <div>
        <TextInput
          type="number"
          label="Price Per Minute After Bishkek:"
          value={formData.pricePerMinuteAfterBishkek}
          onChange={(value) => {
            const safeValue = (value ?? 0) as string | number;
            const eventValue = toStringValue(safeValue);
            handleInputChange(createInputEvent('pricePerMinuteAfterBishkek', eventValue, 'number'));
          }}
          required
        />
      </div>

      {/*Free Wait Time Airport */}
      <div>
        <TextInput
          type="number"
          label="Free Wait Time Airport:"
          value={formData.freeWaitTimeAirport}
          onChange={(value) => {
            const rawValue = (value ?? 0) as string | number;
            const processed = handleFreeWaitTimeChange(rawValue);
            const eventValue = toStringValue(processed);
            handleInputChange(createInputEvent('freeWaitTimeAirport', eventValue, 'number'));
          }}
          required
        />
      </div>

      {/*Price Per Minute After Airport */}
      <div>
        <TextInput
          type="number"
          label="Price Per Minute After Airport:"
          value={formData.pricePerMinuteAfterAirport}
          onChange={(value) => {
            const safeValue = (value ?? 0) as string | number;
            const eventValue = toStringValue(safeValue);
            handleInputChange(createInputEvent('pricePerMinuteAfterAirport', eventValue, 'number'));
          }}
          required
        />
      </div>

      {/*Service Level */}
      <div>
        <SelectSingle
          label="Service Level:"
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
