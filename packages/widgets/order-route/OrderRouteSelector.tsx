import React from 'react';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { DateInput } from '@shared/components/ui/inputs/date';
import { useFormContext, Controller } from 'react-hook-form';
import { Point, User } from '@prisma/client';
import { TextInput } from '@shared/components/ui/inputs';
import { SelectSingle } from '@shared/components/ui/inputs';

interface OrderStartEndSelectorProps {
  getAvailablePoints: (exclude: string[]) => Point[];
  selectedDriverInfo: {
    uuid: string;
    fullName: string;
  } | null;
  clients: User[] | null;
  selectedVehicleType: string;
}

const OrderStartEndSelector: React.FC<OrderStartEndSelectorProps> = ({
  getAvailablePoints,
  selectedDriverInfo,
  clients,
  selectedVehicleType,
}) => {
  const formMethods = useFormContext<CreateOrderData>();
  const { formState, control, setValue, watch } = formMethods;
  const formData = watch();

  const selectedClient = clients?.find((c) => c.uuid === formData.createdBy);

  const formatName = (fullName: string) => {
    const parts = fullName.trim().split(' ');
    if (parts.length === 0) return '';

    const [surname, ...rest] = parts;
    const formattedRest = rest.map((name) => name.charAt(0) + '.').join(' ');

    return `${surname} ${formattedRest}`;
  };

  return (
    <div className="flex gap-4 p-8 bg-white rounded-xl">
      <div className="w-1/5">
        <label className="block mb-2 text-5 leading-5 font-bold">Откуда?</label>
        <Controller
          name="departurePoint"
          control={control}
          render={({ field }) => (
            <SelectSingle
              options={getAvailablePoints([]).map((point) => ({
                label: point.address,
                value: point.uuid,
              }))}
              value={
                field.value
                  ? {
                      label:
                        getAvailablePoints([]).find((p) => p.uuid === field.value)?.address || '',
                      value: field.value,
                    }
                  : null
              }
              onChange={(option) => field.onChange(option?.value || '')}
              placeholder="Отправления"
              className={'text-4 leading-4'}
              classNamePadding={'p-3'}
              classNamePlaceholder={'text-5 leading-5'}
            />
          )}
        />
        {formState.errors.departurePoint && (
          <span className="text-red-500">{formState.errors.departurePoint.message}</span>
        )}
      </div>
      <div className="w-1/5">
        <label className="block mb-2 text-5 leading-5 font-bold">Куда?</label>
        <Controller
          name="arrivalPoint"
          control={control}
          render={({ field }) => (
            <SelectSingle
              options={getAvailablePoints([control._formValues.departurePoint || '']).map(
                (point) => ({
                  label: point.address,
                  value: point.uuid,
                }),
              )}
              value={
                field.value
                  ? {
                      label:
                        getAvailablePoints([control._formValues.departurePoint || '']).find(
                          (p) => p.uuid === field.value,
                        )?.address || '',
                      value: field.value,
                    }
                  : null
              }
              onChange={(option) => {
                field.onChange(option?.value || '');
                setValue('arrivalPoint', option?.value || '');
              }}
              placeholder="Прибытие"
              className={'text-4 leading-4'}
              classNamePadding={'p-3'}
              classNamePlaceholder={'text-5 leading-5'}
            />
          )}
        />
        {formState.errors.arrivalPoint && (
          <span className="text-red-500">{formState.errors.arrivalPoint.message}</span>
        )}
      </div>
      <div className="w-1/5 flex flex-col">
        <label className="block mb-2 text-5 leading-5 font-bold">Когда?</label>
        <Controller
          name="departureTime"
          control={control}
          render={({ field }) => (
            <DateInput
              selectedDate={field.value ? new Date(field.value) : null}
              onChange={(date) => field.onChange(date ? date.toISOString() : null)}
              showTime
              className={'text-4 leading-4 h-full'}
              classNamePlaceholder={'text-5 leading-5'}
            />
          )}
        />
        {formState.errors.departureTime && (
          <span className="text-red-500">{formState.errors.departureTime.message}</span>
        )}
      </div>
      <div className="w-1/5 flex flex-col">
        <label className="block mb-2 text-5 leading-5 font-bold">Номер рейса</label>
        <Controller
          name="flightNumber"
          control={control}
          render={({ field }) => (
            <TextInput
              placeholder="Enter flight number"
              value={field.value || ''}
              onChange={field.onChange}
              className={'text-4 leading-4 h-full'}
              classNamePlaceholder={'text-5 leading-5'}
            />
          )}
        />
        {formState.errors.flightNumber && (
          <span className="text-red-500">{formState.errors.flightNumber.message}</span>
        )}
      </div>
    </div>
  );
};

export default OrderStartEndSelector;
