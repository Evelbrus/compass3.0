import React, { JSX } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput } from '@shared/components/ui/inputs';

const DriverEditStep5 = (): JSX.Element => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-col justify-center">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Bank Name:</label>
          <Controller
            name="driverProfile.bankName"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Bank BIC:</label>
          <Controller
            name="driverProfile.bankBic"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Bank Account Number:</label>
          <Controller
            name="driverProfile.bankAccountNumber"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Card Number:</label>
          <Controller
            name="driverProfile.cardNumber"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default DriverEditStep5;
