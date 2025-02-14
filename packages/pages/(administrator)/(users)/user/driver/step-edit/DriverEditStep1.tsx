//DriverEditStep1.tsx
import React, { JSX } from 'react';
import { Gender } from '@prisma/client';
import { useFormContext, Controller } from 'react-hook-form';
import { ImageUpload, PhoneInput, RadioInput, TextInput } from '@shared/components/ui/inputs';
import {
  validateEmail,
  validateLength,
  validateNoSpecialChars,
  validatePhoneNumber,
} from '@shared/utils/validations';

interface DriverEditStep1Props {
  defaultAvatar?: string;
}

const DriverEditStep1 = ({ defaultAvatar }: DriverEditStep1Props): JSX.Element => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-row justify-center">
      <div className="w-2/3 pr-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
          <div className="mb-4 col-span-1">
            <Controller
              name="email"
              control={control}
              rules={{ validate: validateEmail }}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Email:"
                  type="email"
                  {...field}
                  requiredStar={true}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              )}
            />
          </div>
          <div className="mb-4 col-span-1">
            <Controller
              name="lastName"
              control={control}
              rules={{
                required: 'Поле обязательно для заполнения',
                validate: (value) => validateLength(2, 50)(value) && validateNoSpecialChars(value),
              }}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Фамилия:"
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
            <Controller
              name="firstName"
              control={control}
              rules={{
                required: 'Поле обязательно для заполнения',
                validate: (value) => validateLength(2, 50)(value) && validateNoSpecialChars(value),
              }}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Имя:"
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
            <Controller
              name="middleName"
              control={control}
              rules={{
                required: 'Поле обязательно для заполнения',
                validate: (value) => validateLength(2, 50)(value) && validateNoSpecialChars(value),
              }}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Отчество:"
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
            <Controller
              name="phone"
              control={control}
              rules={{ validate: validatePhoneNumber }}
              render={({ field, fieldState }) => (
                <PhoneInput
                  label="Номер телефона:"
                  {...field}
                  requiredStar={true}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              )}
            />
          </div>
          <div className="relative mb-4 col-span-2 flex flex-col gap-2">
            <p className="block text-4 font-medium text-gray-500">Пол:</p>
            <div className="flex flex-row gap-4">
              <Controller
                name="gender"
                control={control}
                rules={{ required: 'Выберите пол.' }}
                render={({ field, fieldState }) => (
                  <div className="flex flex-row gap-4">
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
                    <div className="absolute bottom-[-25px]">
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
            <Controller
              name="address"
              control={control}
              render={({ field, fieldState }) => (
                <TextInput
                  label="Адрес:"
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
          name="profileImage"
          control={control}
          render={({ field, fieldState }) => (
            <ImageUpload
              {...field}
              value={field.value ?? undefined}
              defaultImage={defaultAvatar}
              label="Аватар Водителя"
              error={!!fieldState.error}
              message={fieldState.error?.message || ''}
              name={field.name}
            />
          )}
        />
      </div>
    </div>
  );
};

export default DriverEditStep1;
