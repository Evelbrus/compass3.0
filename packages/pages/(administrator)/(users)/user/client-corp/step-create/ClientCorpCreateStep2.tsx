import React, { JSX } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput, PhoneInput } from '@shared/components/ui/inputs';
import { validateEmail, validatePhoneNumber } from '@shared/utils/validations';

const ClientCorpCreateStep2 = (): JSX.Element => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-row justify-center">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Company Name:</label>
          <Controller
            name="companyProfile.companyName"
            control={control}
            rules={{ required: 'Поле обязательно для заполнения' }}
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
          <label className="block mb-2 font-bold">Company Email:</label>
          <Controller
            name="companyProfile.email"
            control={control}
            rules={{ validate: validateEmail }}
            render={({ field, fieldState }) => (
              <TextInput
                type="email"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Company Phone:</label>
          <Controller
            name="companyProfile.phone"
            control={control}
            rules={{ validate: validatePhoneNumber }}
            render={({ field, fieldState }) => (
              <PhoneInput
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Company Address:</label>
          <Controller
            name="companyProfile.address"
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
          <label className="block mb-2 font-bold">Website:</label>
          <Controller
            name="companyProfile.website"
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
          <label className="block mb-2 font-bold">Company PIN:</label>
          <Controller
            name="companyProfile.companyPin"
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

export default ClientCorpCreateStep2;
