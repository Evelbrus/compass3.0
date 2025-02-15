'use client';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextInput, PhoneInput, RadioInput } from '@shared/components/ui/inputs';
import { validatePhoneNumber } from '@shared/utils/validations';
import { UserRegisterCard } from '@pages/register/register-section/ui/RegisterSection';

const FIELD_FIRST_NAME = 'firstName';
const FIELD_LAST_NAME = 'lastName';
const FIELD_MIDDLE_NAME = 'middleName';
const FIELD_ADDRESS = 'address';
const FIELD_PHONE = 'phone';
const FIELD_GENDER = 'gender';

const RegisterStepTwo: React.FC = () => {
  const { control, clearErrors } = useFormContext<UserRegisterCard>();

  return (
    <div>
      {/*Имя */}
      <Controller
        name={FIELD_FIRST_NAME}
        control={control}
        defaultValue=""
        rules={{ required: 'Введите имя.' }}
        render={({ field, fieldState }) => (
          <div className="mb-4">
            <TextInput
              label="Имя:"
              type="text"
              value={typeof field.value === 'string' ? field.value : ''}
              placeholder="Введите имя"
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_FIRST_NAME);
                field.onChange(val === null ? '' : val);
              }}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/*Фамилия */}
      <Controller
        name={FIELD_LAST_NAME}
        control={control}
        defaultValue=""
        rules={{ required: 'Введите фамилию.' }}
        render={({ field, fieldState }) => (
          <div className="mb-4">
            <TextInput
              label="Фамилия:"
              type="text"
              value={typeof field.value === 'string' ? field.value : ''}
              placeholder="Введите фамилию"
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_LAST_NAME);
                field.onChange(val === null ? '' : val);
              }}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/*Отчество */}
      <Controller
        name={FIELD_MIDDLE_NAME}
        control={control}
        defaultValue=""
        render={({ field, fieldState }) => (
          <div className="mb-4">
            <TextInput
              label="Отчество:"
              type="text"
              value={typeof field.value === 'string' ? field.value : ''}
              placeholder="Введите отчество"
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_MIDDLE_NAME);
                field.onChange(val === null ? '' : val);
              }}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/*Адрес */}
      <Controller
        name={FIELD_ADDRESS}
        control={control}
        defaultValue=""
        rules={{ required: 'Введите адрес.' }}
        render={({ field, fieldState }) => (
          <div className="mb-4">
            <TextInput
              label="Адрес:"
              type="text"
              value={typeof field.value === 'string' ? field.value : ''}
              placeholder="Введите адрес"
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_ADDRESS);
                field.onChange(val === null ? '' : val);
              }}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/*Телефон */}
      <Controller
        name={FIELD_PHONE}
        control={control}
        defaultValue=""
        rules={{
          required: 'Введите номер телефона.',
          validate: (value) => validatePhoneNumber(value ?? '') || 'Некорректный номер телефона.',
        }}
        render={({ field, fieldState }) => (
          <div className="mb-4">
            <PhoneInput
              label="Телефон:"
              value={typeof field.value === 'string' ? field.value : ''}
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_PHONE);
                field.onChange(val === null ? '' : val);
              }}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/*Пол */}
      <Controller
        name={FIELD_GENDER}
        control={control}
        defaultValue="Male"
        rules={{ required: 'Выберите пол.' }}
        render={({ field, fieldState }) => (
          <div className="mb-4">
            <p className="mb-1 font-semibold">Пол:</p>
            <div className="flex gap-4">
              <RadioInput
                label="Мужской"
                checked={field.value === 'Male'}
                onChange={() => {
                  clearErrors(FIELD_GENDER);
                  field.onChange('Male');
                }}
                name="gender"
              />
              <RadioInput
                label="Женский"
                checked={field.value === 'Female'}
                onChange={() => {
                  clearErrors(FIELD_GENDER);
                  field.onChange('Female');
                }}
                name="gender"
              />
            </div>
            {fieldState.error && (
              <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default RegisterStepTwo;
