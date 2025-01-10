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

const DriverEditStep2 = (): JSX.Element => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-col justify-center">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Birth Date:</label>
          <Controller
            name="driverProfile.birthDate"
            control={control}
            rules={{ validate: validateIsAdult(18) }}
            render={({ field, fieldState }) => (
              <DateInput
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
          <label className="block mb-2 font-bold">Passport Issue Date:</label>
          <Controller
            name="driverProfile.passportIssueDate"
            control={control}
            rules={{ required: 'Дата выдачи паспорта обязательна' }}
            render={({ field, fieldState }) => (
              <DateInput
                selectedDate={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Birth Place:</label>
          <Controller
            name="driverProfile.birthPlace"
            control={control}
            rules={{ required: 'Место рождения обязательно', validate: validateLength(2, 100) }}
            render={({ field, fieldState }) => (
              <TextInput
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
          <label className="block mb-2 font-bold">Citizenship:</label>
          <Controller
            name="driverProfile.citizenship"
            control={control}
            rules={{ required: 'Гражданство обязательно' }}
            render={({ field, fieldState }) => (
              <SelectSingle
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
          <label className="block mb-2 font-bold">Passport ID:</label>
          <Controller
            name="driverProfile.passportId"
            control={control}
            rules={{ required: 'Номер паспорта обязателен', validate: validateLength(5, 20) }}
            render={({ field, fieldState }) => (
              <NumberInput
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
          <label className="block mb-2 font-bold">Passport Issued By:</label>
          <Controller
            name="driverProfile.passportIssued"
            control={control}
            rules={{ required: 'Кем выдан паспорт обязателен', validate: validateLength(2, 100) }}
            render={({ field, fieldState }) => (
              <TextInput
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
          <label className="block mb-2 font-bold">Identity Document:</label>
          <Controller
            name="driverProfile.identityDocument"
            control={control}
            rules={{ required: 'Удостоверение личности обязательно' }}
            render={({ field, fieldState }) => (
              <SelectSingle
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
          <label className="block mb-2 font-bold">Actual Address:</label>
          <Controller
            name="driverProfile.actualAddress"
            control={control}
            rules={{ required: 'Фактический адрес обязателен', validate: validateLength(5, 200) }}
            render={({ field, fieldState }) => (
              <TextInput
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
          <label className="block mb-2 font-bold">Permanent Address:</label>
          <Controller
            name="driverProfile.permanentAddress"
            control={control}
            rules={{ required: 'Постоянный адрес обязателен', validate: validateLength(5, 200) }}
            render={({ field, fieldState }) => (
              <TextInput
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
          <label className="block mb-2 font-bold">Passport Photo Path:</label>
          <Controller
            name="driverProfile.passportPhotoPath"
            control={control}
            render={({ field, fieldState }) => (
              <ImageUpload
                name={field.name}
                label="Загрузите фотографию паспорта"
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
                value={field.value}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Changing Driver:</label>
          <Controller
            name="driverProfile.changingDriver"
            control={control}
            rules={{ required: 'Тип сменного водителя обязателен' }}
            render={({ field, fieldState }) => (
              <SelectSingle
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
          <label className="block mb-2 font-bold">Type of Driver:</label>
          <Controller
            name="driverProfile.typeDriver"
            control={control}
            rules={{ required: 'Тип водителя обязателен' }}
            render={({ field, fieldState }) => (
              <SelectSingle
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
    </div>
  );
};

export default DriverEditStep2;
