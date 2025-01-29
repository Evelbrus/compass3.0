import React from 'react';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { DateInput } from '@shared/components/ui/inputs/date';
import { FieldErrors, useFormContext, Controller } from 'react-hook-form';

interface OrderStartEndSelectorProps {
  getAvailablePoints: (exclude: string[]) => any[];
  handleChangeIntermediatePoint: (index: number, value: string) => void;
  handleRemoveIntermediatePoint: (index: number) => void;
  handleAddIntermediatePoint: () => void;
  errors: FieldErrors<CreateOrderData>;
}

const OrderStartEndSelector: React.FC<OrderStartEndSelectorProps> = ({
  getAvailablePoints,
  handleChangeIntermediatePoint,
  handleRemoveIntermediatePoint,
  handleAddIntermediatePoint,
  errors,
}) => {
  const { control } = useFormContext<CreateOrderData>();

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md shadow-md">
      <Controller
        name="departureTime"
        control={control}
        render={({ field }) => (
          <DateInput
            label="Departure Time:"
            selectedDate={field.value ? new Date(field.value) : null}
            onChange={(date) => field.onChange(date ? date.toISOString() : null)}
            showTime
          />
        )}
      />
      {errors.departureTime && <span className="text-red-500">{errors.departureTime.message}</span>}
      <label>
        Departure Point:
        <Controller
          name="departurePoint"
          control={control}
          render={({ field }) => (
            <select value={field.value || ''} onChange={(e) => field.onChange(e.target.value)}>
              <option value="">Select a departure point</option>
              {getAvailablePoints([]).map((point) => (
                <option key={point.uuid} value={point.uuid}>
                  {point.address}
                </option>
              ))}
            </select>
          )}
        />
        {errors.departurePoint && (
          <span className="text-red-500">{errors.departurePoint.message}</span>
        )}
      </label>

      <label>
        Arrival Point:
        <Controller
          name="arrivalPoint"
          control={control}
          render={({ field }) => (
            <select value={field.value || ''} onChange={(e) => field.onChange(e.target.value)}>
              <option value="">Select an arrival point</option>
              {getAvailablePoints([control._formValues.departurePoint || '']).map((point) => (
                <option key={point.uuid} value={point.uuid}>
                  {point.address}
                </option>
              ))}
            </select>
          )}
        />
        {errors.arrivalPoint && <span className="text-red-500">{errors.arrivalPoint.message}</span>}
      </label>
      <label>
        Intermediate Points:
        <Controller
          name="intermediatePoints"
          control={control}
          render={({ field }) => (
            <>
              {(field.value || []).map((point, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <select
                    value={point}
                    onChange={(e) => {
                      handleChangeIntermediatePoint(index, e.target.value);
                    }}
                  >
                    <option value="">Select an intermediate point</option>
                    {getAvailablePoints([
                      control._formValues.departurePoint || '',
                      control._formValues.arrivalPoint || '',
                      ...(field.value || []).filter((_, i) => i !== index),
                    ]).map((po) => (
                      <option key={po.uuid} value={po.uuid}>
                        {po.address}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => handleRemoveIntermediatePoint(index)}>
                    Remove
                  </button>
                </div>
              ))}
            </>
          )}
        />
        <button type="button" onClick={handleAddIntermediatePoint}>
          Add Intermediate Point
        </button>
        {errors.intermediatePoints && (
          <span className="text-red-500">{errors.intermediatePoints.message}</span>
        )}
      </label>
    </div>
  );
};

export default OrderStartEndSelector;
