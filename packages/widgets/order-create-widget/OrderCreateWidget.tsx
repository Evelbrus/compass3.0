'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';

interface OrderCreateWidgetProps {
  onSubmit: (data: CreateOrderData) => void;
}

const OrderCreateWidget: React.FC<OrderCreateWidgetProps> = ({ onSubmit }) => {
  const { watch, setValue, handleSubmit, formState } = useFormContext<CreateOrderData>();
  const formData = watch();

  return (
    <form
      onSubmit={handleSubmit((data) => {
        console.log('OrderCreateWidget handleSubmit called with data:', data);
        onSubmit(data);
      })}
      className="flex flex-col gap-4 p-4 border rounded-md shadow-md"
    >
      <label>
        Base Price:
        <input
          type="number"
          defaultValue={formData.basePrice ?? 0}
          onChange={(e) => setValue('basePrice', Number(e.target.value))}
        />
      </label>
      {formState.errors.basePrice?.message && (
        <span className="text-red-500">{formState.errors.basePrice.message}</span>
      )}
      <button type="submit">Create Order</button>
    </form>
  );
};

export default OrderCreateWidget;
