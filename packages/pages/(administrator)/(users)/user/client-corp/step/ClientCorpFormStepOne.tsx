import React from 'react';
import { Gender } from '@prisma/client';
import { useFormContext, Controller } from 'react-hook-form';
import { PhoneInput, RadioInput, TextInput } from '@shared/components/ui/inputs';
import {
  validateEmail,
  validateLength,
  validateNoSpecialChars,
  validatePassword,
  validatePhoneNumber,
} from '@shared/utils/validations';
import { UserCard } from '@pages/(administrator)/(users)/user/useClientsAdminForm';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';

interface ClientCorpFormStepOneProps {
  profilePhotoPath?: string | null;
  mode: 'create' | 'edit';
  setPreview: (url: string) => void;
}

const ClientCorpFormStepOne: React.FC<ClientCorpFormStepOneProps> = ({
  profilePhotoPath,
  mode,
  setPreview,
}) => {
  const { control, getValues, clearErrors } = useFormContext<UserCard>();

  return (
    <div className="flex flex-row justify-center">
      {/*Левая колонка – текстовые поля */}
      <div className="w-2/3">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
          {/*Имя */}
          <Controller
            name="firstName"
            control={control}
            defaultValue=""
            rules={{
              required: 'Имя обязательно',
              validate: (value) =>
                (validateLength(2, 50)(value) && validateNoSpecialChars(value)) ||
                'Некорректное имя',
            }}
            render={({ field, fieldState }) => (
              <TextInput
                label="Имя:"
                type="text"
                value={field.value ?? ''}
                onChange={(newValue) => {
                  clearErrors('firstName');
                  field.onChange(newValue);
                }}
                required
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />

          {/*Фамилия */}
          <Controller
            name="lastName"
            control={control}
            defaultValue=""
            rules={{
              required: 'Фамилия обязательна',
              validate: (value) =>
                (validateLength(2, 50)(value) && validateNoSpecialChars(value)) ||
                'Некорректная фамилия',
            }}
            render={({ field, fieldState }) => (
              <TextInput
                label="Фамилия:"
                type="text"
                value={field.value ?? ''}
                onChange={(newValue) => {
                  clearErrors('lastName');
                  field.onChange(newValue);
                }}
                required
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />

          {/*Отчество */}
          <Controller
            name="middleName"
            control={control}
            defaultValue=""
            render={({ field, fieldState }) => (
              <TextInput
                label="Отчество:"
                type="text"
                value={field.value ?? ''}
                onChange={(newValue) => {
                  clearErrors('middleName');
                  field.onChange(newValue);
                }}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />

          {/*Email */}
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{
              required: 'Email обязателен',
              validate: validateEmail,
            }}
            render={({ field, fieldState }) => (
              <TextInput
                label="Email:"
                type="email"
                value={field.value ?? ''}
                onChange={(newValue) => {
                  clearErrors('email');
                  field.onChange(newValue);
                }}
                required
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />

          {/*Пароль и подтверждение пароля (только при создании) */}
          {mode === 'create' && (
            <>
              {/*Пароль */}
              <Controller
                name="password"
                control={control}
                defaultValue=""
                rules={{
                  validate: (value: string | undefined) => validatePassword(value || ''),
                }}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="Пароль:"
                    type="password"
                    value={field.value ?? ''}
                    onChange={(newValue) => {
                      clearErrors('password');
                      field.onChange(newValue);
                    }}
                    required
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />

              {/*Подтверждение пароля */}
              <Controller
                name="confirmPassword"
                control={control}
                defaultValue=""
                rules={{
                  required: 'Подтверждение пароля обязательно',
                  validate: (value) => value === getValues('password') || 'Пароли не совпадают',
                }}
                render={({ field, fieldState }) => (
                  <TextInput
                    label="Подтверждение пароля:"
                    type="password"
                    value={field.value ?? ''}
                    onChange={(newValue) => {
                      clearErrors('confirmPassword');
                      field.onChange(newValue);
                    }}
                    required
                    error={!!fieldState.error}
                    message={fieldState.error?.message || ''}
                  />
                )}
              />
            </>
          )}

          {/*Телефон */}
          <Controller
            name="phone"
            control={control}
            defaultValue=""
            rules={{
              required: 'Телефон обязателен',
              validate: validatePhoneNumber,
            }}
            render={({ field, fieldState }) => (
              <PhoneInput
                label="Телефон:"
                value={field.value ?? ''}
                onChange={(newValue) => {
                  clearErrors('phone');
                  field.onChange(newValue);
                }}
                requiredStar
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />

          {/*Пол (radio) */}
          <div className="relative col-span-2 flex flex-col gap-2">
            <p className="block text-sm font-medium text-gray-700">Пол:</p>
            <div className="flex flex-row gap-4">
              <Controller
                name="gender"
                control={control}
                defaultValue={Gender.Male}
                rules={{ required: 'Выберите пол.' }}
                render={({ field, fieldState }) => {
                  const handleGenderChange = (selected: Gender) => {
                    clearErrors('gender');
                    field.onChange(selected);
                  };
                  return (
                    <div className="flex flex-row gap-4">
                      <RadioInput
                        label="Мужской"
                        checked={field.value === Gender.Male}
                        onChange={() => handleGenderChange(Gender.Male)}
                        name="gender"
                      />
                      <RadioInput
                        label="Женский"
                        checked={field.value === Gender.Female}
                        onChange={() => handleGenderChange(Gender.Female)}
                        name="gender"
                      />
                      {fieldState.error && (
                        <p className="text-red-600 text-sm mt-2">{fieldState.error.message}</p>
                      )}
                    </div>
                  );
                }}
              />
            </div>
          </div>

          {/*Адрес */}
          <Controller
            name="address"
            control={control}
            defaultValue=""
            rules={{ required: 'Адрес обязателен' }}
            render={({ field, fieldState }) => (
              <TextInput
                label="Адрес:"
                type="text"
                value={field.value ?? ''}
                onChange={(newValue) => {
                  clearErrors('address');
                  field.onChange(newValue);
                }}
                required
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
      </div>

      {/*Правая колонка – загрузка и редактирование изображения */}
      <div className="w-1/3 flex flex-col items-center justify-start">
        <Controller
          name="profileImage"
          control={control}
          render={({ field, fieldState }) => (
            <ImageUploadWithCrop
              label="Фото профиля:"
              initialSrc={profilePhotoPath || undefined}
              required={false}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message || ''}
              onChange={(file) => {
                clearErrors('profileImage');
                field.onChange(file);
                if (file) {
                  const url = URL.createObjectURL(file);
                  setPreview(url);
                } else {
                  setPreview('');
                }
              }}
              containerWidth={400}
              containerHeight={350}
              aspect={1}
            />
          )}
        />
      </div>
    </div>
  );
};

export default ClientCorpFormStepOne;
