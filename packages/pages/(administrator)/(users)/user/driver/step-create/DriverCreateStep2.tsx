import React, { JSX } from 'react';
import { subYears } from 'date-fns';
import { useFormContext, Controller } from 'react-hook-form';
import {
  SelectSingle,
  TextInput,
  NumberInput,
  ImageUpload,
  DateInput,
} from '@shared/components/ui/inputs';
import { validateIsAdult, validateLength } from '@shared/utils/validations';
import {
  changingDriverOptions,
  citizenshipOptions,
  driverTypeOptions,
  identityDocumentOptions,
} from '@shared/lib/effector/drivers/optionsTranslation/optionsTranslationDriver';

const DriverCreateStep2 = (): JSX.Element => {
  const { control } = useFormContext();

  return (
    <div className="flex items-center justify-center">
      <div className="w-2/3 grid grid-cols-2 gap-x-8 gap-y-4 p-6">
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.birthDate"
            control={control}
            rules={{ validate: validateIsAdult(18) }}
            render={({ field, fieldState }) => (
              <DateInput
                label="Дата рождения:"
                maxDate={subYears(new Date(), 18)}
                selectedDate={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.passportIssueDate"
            control={control}
            rules={{ required: 'Дата выдачи паспорта обязательна' }}
            render={({ field, fieldState }) => (
              <DateInput
                label="Дата выдачи паспорта:"
                selectedDate={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        {/*Остальные поля */}
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.birthPlace"
            control={control}
            rules={{ required: 'Место рождения обязательно', validate: validateLength(2, 100) }}
            render={({ field, fieldState }) => (
              <TextInput
                label="Место рождения:"
                type="text"
                {...field}
                value={field.value || ''}
                maxLength={100}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.citizenship"
            control={control}
            rules={{ required: 'Гражданство обязательно' }}
            render={({ field, fieldState }) => (
              <SelectSingle
                label="Гражданство:"
                options={citizenshipOptions}
                value={citizenshipOptions.find((option) => option.value === field.value) || null}
                onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
                placeholder="Выберите гражданство"
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.passportId"
            control={control}
            rules={{ required: 'Номер паспорта обязателен', validate: validateLength(5, 20) }}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Идентификатор паспорта:"
                value={field.value}
                onChange={(value) => field.onChange(String(value))}
                maxLength={20}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.passportIssued"
            control={control}
            rules={{ required: 'Кем выдан паспорт обязателен', validate: validateLength(2, 100) }}
            render={({ field, fieldState }) => (
              <TextInput
                label="Паспорт выдан:"
                type="text"
                {...field}
                value={field.value || ''}
                maxLength={100}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.identityDocument"
            control={control}
            rules={{ required: 'Удостоверение личности обязательно' }}
            render={({ field, fieldState }) => (
              <SelectSingle
                label="Документ, удостоверяющий личность:"
                options={identityDocumentOptions}
                value={
                  identityDocumentOptions.find((option) => option.value === field.value) || null
                }
                onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
                placeholder="Выберите удостоверение личности"
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.actualAddress"
            control={control}
            rules={{ required: 'Фактический адрес обязателен', validate: validateLength(5, 200) }}
            render={({ field, fieldState }) => (
              <TextInput
                label="Фактический адрес:"
                type="text"
                {...field}
                value={field.value || ''}
                maxLength={200}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.permanentAddress"
            control={control}
            rules={{ required: 'Постоянный адрес обязателен', validate: validateLength(5, 200) }}
            render={({ field, fieldState }) => (
              <TextInput
                label="Постоянный адрес:"
                type="text"
                {...field}
                value={field.value || ''}
                maxLength={200}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.changingDriver"
            control={control}
            rules={{ required: 'Тип сменного водителя обязателен' }}
            render={({ field, fieldState }) => (
              <SelectSingle
                label="Смена водителя:"
                options={changingDriverOptions}
                value={changingDriverOptions.find((option) => option.value === field.value) || null}
                onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
                placeholder="Выберите тип сменного водителя"
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.typeDriver"
            control={control}
            rules={{ required: 'Тип водителя обязателен' }}
            render={({ field, fieldState }) => (
              <SelectSingle
                label="Тип водителя:"
                options={driverTypeOptions}
                value={driverTypeOptions.find((option) => option.value === field.value) || null}
                onChange={(selectedOption) => field.onChange(selectedOption?.value)}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
                placeholder="Выберите тип водителя"
              />
            )}
          />
        </div>
      </div>
      <div className="w-1/3 mb-4">
        <Controller
          name="driverProfile.passportImage"
          control={control}
          render={({ field, fieldState }) => (
            <ImageUpload
              passportPhoto
              name={field.name}
              label="Загрузите фотографию паспорта"
              error={!!fieldState.error}
              message={fieldState.error?.message || ''}
              value={field.value}
            />
          )}
        />
        <Controller
          name="driverProfile.profileImage"
          control={control}
          render={({ field, fieldState }) => (
            <ImageUpload
              licensePhoto
              name={field.name}
              label="Загрузите фотографию водительского удостоверения"
              error={!!fieldState.error}
              message={fieldState.error?.message || ''}
              value={field.value}
            />
          )}
        />
      </div>
    </div>
  );
};

export default DriverCreateStep2;
