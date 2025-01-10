import React, { JSX } from 'react';
import { Gender } from '@prisma/client';
import { useFormContext, Controller } from 'react-hook-form';
import { PhoneInput, RadioInput, TextInput, ImageUpload } from '@shared/components/ui/inputs';
import {
  validateLength,
  validateNoSpecialChars,
  validatePhoneNumber,
} from '@shared/utils/validations';

const ClientCorpEditStep1 = (): JSX.Element => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-row justify-center">
      <div className="w-2/3 pr-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
          <div className="mb-4 col-span-1">
            <label className="block mb-2 font-bold">Email:</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => <TextInput type="email" {...field} readOnly />}
            />
          </div>
          <div className="mb-4 col-span-1">
            <label className="block mb-2 font-bold">Last Name:</label>
            <Controller
              name="lastName"
              control={control}
              rules={{
                required: 'Поле обязательно для заполнения',
                validate: (value) => validateLength(2, 50)(value) && validateNoSpecialChars(value),
              }}
              render={({ field, fieldState }) => (
                <TextInput
                  type="text"
                  {...field}
                  requiredStar={true}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              )}
            />
          </div>
          <div className="mb-4 col-span-1">
            <label className="block mb-2 font-bold">First Name:</label>
            <Controller
              name="firstName"
              control={control}
              rules={{
                required: 'Поле обязательно для заполнения',
                validate: (value) => validateLength(2, 50)(value) && validateNoSpecialChars(value),
              }}
              render={({ field, fieldState }) => (
                <TextInput
                  type="text"
                  {...field}
                  requiredStar={true}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              )}
            />
          </div>
          <div className="mb-4 col-span-1">
            <label className="block mb-2 font-bold">Middle Name:</label>
            <Controller
              name="middleName"
              control={control}
              rules={{
                required: 'Поле обязательно для заполнения',
                validate: (value) => validateLength(2, 50)(value) && validateNoSpecialChars(value),
              }}
              render={({ field, fieldState }) => (
                <TextInput
                  type="text"
                  {...field}
                  requiredStar={true}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              )}
            />
          </div>
          <div className="mb-4 col-span-2">
            <label className="block mb-2 font-bold">Phone:</label>
            <Controller
              name="phone"
              control={control}
              rules={{ validate: validatePhoneNumber }}
              render={({ field, fieldState }) => (
                <PhoneInput
                  {...field}
                  requiredStar={true}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              )}
            />
          </div>
          <div className="relative mb-4 col-span-2 flex flex-col gap-2">
            <p className="text-4 leading-4 font-semibold">Пол:</p>
            <div className="flex flex-row gap-4">
              <Controller
                name="gender"
                control={control}
                rules={{ required: 'Выберите пол.' }}
                render={({ field, fieldState }) => (
                  <div className={'flex flex-row gap-4'}>
                    <RadioInput
                      label="Мужской"
                      checked={field.value === Gender.Male}
                      onChange={() => field.onChange(Gender.Male)}
                      name="gender"
                      requiredStar={true}
                    />
                    <RadioInput
                      label="Женский"
                      checked={field.value === Gender.Female}
                      onChange={() => field.onChange(Gender.Female)}
                      name="gender"
                      requiredStar={true}
                    />
                    <div className={'absolute bottom-[-25px]'}>
                      {fieldState.error && (
                        <p className="text-red-600 text-sm mt-2">{fieldState.error.message}</p>
                      )}
                    </div>
                  </div>
                )}
              />
            </div>
          </div>
          <div className="mb-4 col-span-2">
            <label className="block mb-2 font-bold">Address:</label>
            <Controller
              name="address"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  type="text"
                  {...field}
                  value={field.value ?? ''}
                  requiredStar={true}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              )}
            />
          </div>
        </div>
      </div>
      <div className="w-1/3 flex items-start justify-center p-6">
        <Controller
          name="profilePhotoPath"
          control={control}
          render={({ field, fieldState }) => (
            <ImageUpload
              {...field}
              value={field.value ?? ''}
              label="Аватар Корпоративного Клиента"
              error={!!fieldState.error}
              message={fieldState.error?.message || ''}
            />
          )}
        />
      </div>
    </div>
  );
};

export default ClientCorpEditStep1;
