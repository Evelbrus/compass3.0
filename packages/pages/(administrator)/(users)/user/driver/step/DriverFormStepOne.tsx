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
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import { userFormData } from '@shared/prisma/interfaceForm/user/userFormData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

interface DriverFormStepOneProps {
  profilePhotoPath?: string | null;
  setImagePreview?: (url: string) => void;
  mode: 'create' | 'edit';
}

const DriverFormStepOne: React.FC<DriverFormStepOneProps> = ({
  profilePhotoPath,
  setImagePreview,
  mode,
}) => {
  const { control, getValues, clearErrors } = useFormContext<userFormData>();

  return (
    <AnimatedComponent duration={300}>
      <div className="w-full flex flex-col">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-row border-b border-gray-100">
            {/* Левая часть - персональная информация */}
            <div className="w-2/3 border-r">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center p-6 border-b">
                  Персональная информация
                </h3>
                <div className="p-6">
                  {/* Фамилия и Имя */}
                  <div className="grid grid-cols-2 gap-4">
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
                          label="Фамилия"
                          placeholder="Введите фамилию"
                          type="text"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('lastName');
                            field.onChange(newValue);
                          }}
                          onFocus={() => clearErrors('lastName')}
                          required={true}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
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
                          label="Имя"
                          placeholder="Введите имя"
                          type="text"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('firstName');
                            field.onChange(newValue);
                          }}
                          onFocus={() => clearErrors('firstName')}
                          required={true}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>

                  {/* Отчество и пол */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="middleName"
                      control={control}
                      defaultValue=""
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Отчество"
                          placeholder="Введите отчество"
                          type="text"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('middleName');
                            field.onChange(newValue);
                          }}
                          onFocus={() => clearErrors('middleName')}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                    <div>
                      <p className="text-sm text-gray-500 font-bold ml-[10px] mb-2">Пол</p>
                      <div className="flex items-center p-3">
                        <Controller
                          name="gender"
                          control={control}
                          defaultValue={Gender.Male}
                          rules={{ required: 'Выберите пол' }}
                          render={({ field, fieldState }) => {
                            const handleGenderChange = (selected: Gender) => {
                              clearErrors('gender');
                              field.onChange(selected);
                            };
                            return (
                              <div className="flex flex-row gap-6">
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
                                  <p className="text-red-600 text-xs">{fieldState.error.message}</p>
                                )}
                              </div>
                            );
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email и телефон */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="email"
                      control={control}
                      defaultValue=""
                      rules={{ validate: validateEmail }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Email"
                          placeholder="email@example.com"
                          type="email"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('email');
                            field.onChange(newValue);
                          }}
                          onFocus={() => clearErrors('email')}
                          required={true}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                    <Controller
                      name="phone"
                      control={control}
                      rules={{ validate: validatePhoneNumber }}
                      render={({ field, fieldState }) => (
                        <PhoneInput
                          label="Телефон"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('phone');
                            field.onChange(newValue);
                          }}
                          onFocus={() => clearErrors('phone')}
                          requiredStar={true}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>

                  {/* Адрес */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Controller
                        name="address"
                        control={control}
                        defaultValue=""
                        render={({ field, fieldState }) => (
                          <TextInput
                            label="Адрес"
                            placeholder="Введите полный адрес"
                            type="text"
                            value={field.value ?? ''}
                            onChange={(newValue) => {
                              clearErrors('address');
                              field.onChange(newValue);
                            }}
                            onFocus={() => clearErrors('address')}
                            error={!!fieldState.error}
                            message={fieldState.error?.message || ''}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
                {/* Секция безопасности (только при создании) */}
                {mode === 'create' && (
                  <AnimatedComponent duration={500}>
                    <div className="flex flex-col border-t">
                      <h3 className="text-lg font-medium text-gray-900 flex items-center p-6 border-b">
                        Безопасность
                      </h3>
                      <div className={'w-full flex flex-row gap-4 p-6'}>
                        <Controller
                          name="password"
                          control={control}
                          defaultValue=""
                          rules={{
                            required: 'Пароль обязателен',
                            validate: (value: string | undefined) => validatePassword(value || ''),
                          }}
                          render={({ field, fieldState }) => (
                            <TextInput
                              label="Пароль"
                              placeholder="Введите пароль"
                              type="password"
                              value={field.value ?? ''}
                              onChange={(value) => {
                                clearErrors('password');
                                field.onChange(value);
                              }}
                              onFocus={() => clearErrors('password')}
                              required
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                        <Controller
                          name="confirmPassword"
                          control={control}
                          defaultValue=""
                          rules={{
                            required: 'Подтверждение пароля обязательно',
                            validate: (value) =>
                              value === getValues('password') || 'Пароли не совпадают',
                          }}
                          render={({ field, fieldState }) => (
                            <TextInput
                              label="Подтверждение пароля"
                              placeholder="Повторите пароль"
                              type="password"
                              value={field.value ?? ''}
                              onChange={(value) => {
                                clearErrors('confirmPassword');
                                field.onChange(value);
                              }}
                              onFocus={() => clearErrors('confirmPassword')}
                              required
                              error={!!fieldState.error}
                              message={fieldState.error?.message || ''}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </AnimatedComponent>
                )}
              </div>
            </div>

            {/* Правая часть - фото профиля */}
            <div className="w-1/3 bg-gray-50 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Фотография профиля</h3>
              <div className="flex flex-col items-center">
                <AnimatedComponent duration={500} className="w-full">
                  <Controller
                    name="profilePhotoPath"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[400px]">
                        <ImageUploadWithCrop
                          initialImage={profilePhotoPath || undefined}
                          required={false}
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message || ''}
                          onChange={(file) => {
                            clearErrors('profilePhotoPath');
                            field.onChange(file);
                            if (setImagePreview) {
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setImagePreview(url);
                              } else {
                                setImagePreview('');
                              }
                            }
                          }}
                          aspect={1}
                        />
                      </div>
                    )}
                  />
                </AnimatedComponent>
                <p className="text-xs text-gray-500 mt-3">
                  Рекомендуемый размер: не менее 300x300 пикселей. Поддерживаемые форматы: JPG, PNG.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedComponent>
  );
};

export default DriverFormStepOne;
