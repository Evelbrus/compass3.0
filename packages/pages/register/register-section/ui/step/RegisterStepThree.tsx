'use client';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { TextInput, PhoneInput } from '@shared/components/ui/inputs';
import { validateEmail } from '@shared/utils/validations';
import { UserRegisterCard } from '@pages/register/register-section/ui/RegisterSection';

const FIELD_COMPANY_PROFILE_COMPANY_NAME = 'companyProfile.companyName';
const FIELD_COMPANY_PROFILE_COMPANY_PIN = 'companyProfile.companyPin';
const FIELD_COMPANY_PROFILE_EMAIL = 'companyProfile.email';
const FIELD_COMPANY_PROFILE_PHONE = 'companyProfile.phone';
const FIELD_COMPANY_PROFILE_WEBSITE = 'companyProfile.website';
const FIELD_COMPANY_PROFILE_ADDRESS = 'companyProfile.address';

const RegisterStepThree: React.FC = () => {
  const { control, clearErrors } = useFormContext<UserRegisterCard>();

  return (
    <div>
      {/*Название компании */}
      <Controller
        name={FIELD_COMPANY_PROFILE_COMPANY_NAME}
        control={control}
        defaultValue=""
        rules={{ required: 'Введите название компании.' }}
        render={({ field, fieldState }) => (
          <div>
            <TextInput
              label="Название компании:"
              type="text"
              value={typeof field.value === 'string' ? field.value : ''}
              placeholder="Введите название компании"
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_COMPANY_PROFILE_COMPANY_NAME);
                field.onChange(val === null ? '' : val);
              }}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/*PIN компании */}
      <Controller
        name={FIELD_COMPANY_PROFILE_COMPANY_PIN}
        control={control}
        defaultValue=""
        rules={{ required: 'Введите PIN компании.' }}
        render={({ field, fieldState }) => (
          <div>
            <TextInput
              label="PIN компании:"
              type="text"
              value={typeof field.value === 'string' ? field.value : ''}
              placeholder="Введите PIN компании"
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_COMPANY_PROFILE_COMPANY_PIN);
                field.onChange(val === null ? '' : val);
              }}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/*Email компании */}
      <Controller
        name={FIELD_COMPANY_PROFILE_EMAIL}
        control={control}
        defaultValue=""
        rules={{
          required: 'Введите email компании.',
          validate: (value) => validateEmail(value ?? '') || 'Некорректный email.',
        }}
        render={({ field, fieldState }) => (
          <div>
            <TextInput
              label="Email компании:"
              type="email"
              value={typeof field.value === 'string' ? field.value : ''}
              placeholder="Введите email компании"
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_COMPANY_PROFILE_EMAIL);
                field.onChange(val === null ? '' : val);
              }}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/*Телефон компании */}
      <Controller
        name={FIELD_COMPANY_PROFILE_PHONE}
        control={control}
        defaultValue=""
        rules={{ required: 'Введите телефон компании.' }}
        render={({ field, fieldState }) => (
          <div>
            <PhoneInput
              label="Телефон компании:"
              value={typeof field.value === 'string' ? field.value : ''}
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_COMPANY_PROFILE_PHONE);
                field.onChange(val === null ? '' : val);
              }}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/*Сайт компании */}
      <Controller
        name={FIELD_COMPANY_PROFILE_WEBSITE}
        control={control}
        defaultValue=""
        rules={{ required: 'Введите сайт компании.' }}
        render={({ field, fieldState }) => (
          <div>
            <TextInput
              label="Сайт компании:"
              type="text"
              value={typeof field.value === 'string' ? field.value : ''}
              placeholder="Введите сайт компании"
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_COMPANY_PROFILE_WEBSITE);
                field.onChange(val === null ? '' : val);
              }}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />

      {/*Адрес компании */}
      <Controller
        name={FIELD_COMPANY_PROFILE_ADDRESS}
        control={control}
        defaultValue=""
        rules={{ required: 'Введите адрес компании.' }}
        render={({ field, fieldState }) => (
          <div>
            <TextInput
              label="Адрес компании:"
              type="text"
              value={typeof field.value === 'string' ? field.value : ''}
              placeholder="Введите адрес компании"
              error={!!fieldState.error}
              onChange={(val: string | number | bigint | null) => {
                clearErrors(FIELD_COMPANY_PROFILE_ADDRESS);
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

export default RegisterStepThree;
