import React, { JSX } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput, PhoneInput } from '@shared/components/ui/inputs';
import { validateEmail, validatePhoneNumber } from '@shared/utils/validations';

const ClientCorpCreateStep2 = (): JSX.Element => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-row justify-center">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6 w-full">
        <div className="mb-4 col-span-1">
          <Controller
            name="companyProfile.companyName"
            control={control}
            rules={{ required: 'Поле обязательно для заполнения' }}
            render={({ field, fieldState }) => (
              <TextInput
                label="Название компании:"
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="companyProfile.email"
            control={control}
            rules={{ validate: validateEmail }}
            render={({ field, fieldState }) => (
              <TextInput
                label="Электронная почта компании:"
                type="email"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="companyProfile.phone"
            control={control}
            rules={{ validate: validatePhoneNumber }}
            render={({ field, fieldState }) => (
              <PhoneInput
                label="Телефон компании:"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="companyProfile.address"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Адрес компании:"
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="companyProfile.website"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="Веб-сайт:"
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="companyProfile.companyPin"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                label="PIN-код компании:"
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
