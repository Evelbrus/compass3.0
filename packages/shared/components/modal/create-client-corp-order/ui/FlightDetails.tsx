//FlightDetails.tsx
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { CreateClientCorpOrderData } from '@shared/components/modal/create-client-corp-order/hooks/useCreateClientCorpOrder';

interface FlightDetailsProps {
  control: Control<CreateClientCorpOrderData>;
}

const FlightDetails: React.FC<FlightDetailsProps> = ({ control }) => {
  return (
    <div className="w-full flex flex-col gap-4 p-4 border rounded-md">
      <div>
        <label htmlFor="flightNumber" className="block mb-1 font-bold">
          Номер авиарейс
        </label>
        <Controller
          name="flightNumber"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              id="flightNumber"
              type="text"
              placeholder="Введите номер рейса"
              className="w-full border rounded px-3 py-2"
            />
          )}
        />
      </div>
      <div>
        <label htmlFor="description" className="block mb-1 font-bold">
          Описание к заказу
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              id="description"
              placeholder="Введите описание"
              className="w-full h-[200px] border rounded px-3 py-2 resize-none"
              style={{ resize: 'none' }}
            />
          )}
        />
      </div>
    </div>
  );
};

export default FlightDetails;
