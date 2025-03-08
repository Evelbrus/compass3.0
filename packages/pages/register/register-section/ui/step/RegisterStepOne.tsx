'use client';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextInput } from '@shared/components/ui/inputs';
import { validateEmail, validatePassword } from '@shared/utils/validations';
import { UserRegisterCard } from '@pages/register/register-section/ui/RegisterSection';

const FIELD_EMAIL = 'email';
const FIELD_PASSWORD = 'password';
const FIELD_CONFIRM_PASSWORD = 'confirmPassword';

// Удаляем проп firstInputRef, так как мы не можем его использовать
const RegisterStepOne: React.FC = () => {
  const { control, clearErrors, getValues } = useFormContext<UserRegisterCard>();

  return (
    <div>
      {/*Email */}
      <Controller
        name={FIELD_EMAIL}
        control={control}
        defaultValue=""
        rules={{
          required: 'Введите email.',
          validate: (value) => validateEmail(value) || 'Некорректный email.',
        }}
        render={({ field, fieldState }) => (
          <div>
            <TextInput
              label="Email:"
              type="email"
              value={typeof field.value === 'string' ? field.value : ''}
              placeholder="Введите email"
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_EMAIL);
                field.onChange(val === null ? '' : val);
              }}
              // Удаляем inputRef, поскольку TextInput его не поддерживает
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/*Пароль */}
      <Controller
        name={FIELD_PASSWORD}
        control={control}
        defaultValue=""
        rules={{
          required: 'Введите пароль.',
          validate: (value) =>
            validatePassword(value ?? '') || 'Пароль не удовлетворяет требованиям.',
        }}
        render={({ field, fieldState }) => (
          <div>
            <TextInput
              label="Пароль:"
              type="password"
              value={typeof field.value === 'string' ? field.value : ''}
              placeholder="Введите пароль"
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_PASSWORD);
                field.onChange(val === null ? '' : val);
              }}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/*Подтверждение пароля */}
      <Controller
        name={FIELD_CONFIRM_PASSWORD}
        control={control}
        defaultValue=""
        rules={{
          required: 'Подтвердите пароль.',
          validate: (value) => value === getValues(FIELD_PASSWORD) || 'Пароли не совпадают.',
        }}
        render={({ field, fieldState }) => (
          <div>
            <TextInput
              label="Подтверждение пароля:"
              type="password"
              value={typeof field.value === 'string' ? field.value : ''}
              placeholder="Подтвердите пароль"
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_CONFIRM_PASSWORD);
                field.onChange(val === null ? '' : val);
              }}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />
    </div>
  );
};

export default RegisterStepOne;
