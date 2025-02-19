import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { UserCard } from '@pages/(administrator)/(users)/user/useClientsAdminForm';
import { TextInput, SelectSingle } from '@shared/components/ui/inputs';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import {
  citizenshipOptions,
  partnerOptions,
} from '@shared/lib/effector/drivers/optionsTranslation/optionsTranslationDriver';
import { identityDocumentOptions } from '@shared/lib/effector/drivers/optionsTranslation/optionsTranslationDriver';
import { changingDriverOptions } from '@shared/lib/effector/drivers/optionsTranslation/optionsTranslationDriver';
import { ChangingDriver, Citizenship, IdentityDocument, PartnerCompany } from '@prisma/client';
import { SelectOption } from '@shared/lib/effector';

//Определяем константы для имен полей.
const FIELD_CITIZENSHIP = 'driverProfile.citizenship';
const FIELD_IDENTITY_DOCUMENT = 'driverProfile.identityDocument';
const FIELD_PASSPORT_ID = 'driverProfile.passportId';
const FIELD_PASSPORT_ISSUE_DATE = 'driverProfile.passportIssueDate';
const FIELD_PASSPORT_ISSUED = 'driverProfile.passportIssued';
const FIELD_BIRTH_DATE = 'driverProfile.birthDate';
const FIELD_BIRTH_PLACE = 'driverProfile.birthPlace';
const FIELD_ACTUAL_ADDRESS = 'driverProfile.actualAddress';
const FIELD_PERMANENT_ADDRESS = 'driverProfile.permanentAddress';
const FIELD_CHANGING_DRIVER = 'driverProfile.changingDriver';
const FIELD_PASSPORT_IMAGE = 'driverProfile.passportImage';
const FIELD_DRIVER_PROFILE_IMAGE = 'driverProfile.driverProfileImage';
const FIELD_PARTNER_COMPANY = 'partnerCompany';
const FIELD_INDIVIDUAL_SALARY_RATE = 'individualSalaryRate';

//Функция форматирования даты в "YYYY-MM-DD"
function formatDate(value: unknown): string {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString().substring(0, 10);
  }
  return '';
}

//Интерфейс пропсов
interface DriverFormStepTwoProps {
  passportPhotoSrc?: string | null;
  driverProfilePhotoSrc?: string | null;
  setPassportPreview?: (url: string) => void;
  setDriverProfilePhotoPreview?: (url: string) => void;
}

const DriverFormStepTwo: React.FC<DriverFormStepTwoProps> = ({
  passportPhotoSrc,
  driverProfilePhotoSrc,
  setPassportPreview,
  setDriverProfilePhotoPreview,
}) => {
  const { control, clearErrors } = useFormContext<UserCard>();

  return (
    <div className="flex flex-row flex-wrap justify-center">
      {/*Левая колонка — личные и паспортные данные */}
      <div className="w-2/3">
        <h3 className="text-lg font-semibold px-6 mt-4">Личная информация и паспортные данные</h3>

        <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
          {/*Гражданство (SelectSingle) */}
          <Controller
            name={FIELD_CITIZENSHIP}
            control={control}
            defaultValue={citizenshipOptions[1]?.value || 'KG'}
            rules={{ required: 'Гражданство обязательно' }}
            render={({ field, fieldState }) => {
              const selectedOption =
                (citizenshipOptions.find(
                  (opt) => opt.value === field.value,
                ) as SelectOption<Citizenship> | null) || null;

              //Обработчик onChange для гражданства
              const handleSelectChange = (option: SelectOption<Citizenship> | null) => {
                clearErrors(FIELD_CITIZENSHIP);
                field.onChange(option?.value ?? '');
              };

              return (
                <SelectSingle
                  label="Гражданство"
                  options={citizenshipOptions}
                  value={selectedOption}
                  onChange={handleSelectChange}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                  requiredStar
                  placeholder="Выберите гражданство"
                />
              );
            }}
          />

          {/*Документ удостоверения (SelectSingle) */}
          <Controller
            name={FIELD_IDENTITY_DOCUMENT}
            control={control}
            defaultValue={identityDocumentOptions[1]?.value || 'Kyrgyzstan'}
            rules={{ required: 'Документ удостоверения обязателен' }}
            render={({ field, fieldState }) => {
              //Приводим опции, чтобы label всегда был строкой, аналогично гражданству
              const normalizedOptions: SelectOption<IdentityDocument>[] =
                identityDocumentOptions.map((opt) => ({
                  ...opt,
                  label: opt.label ? String(opt.label) : '',
                }));

              const selectedOption =
                (normalizedOptions.find(
                  (opt) => opt.value === field.value,
                ) as SelectOption<IdentityDocument> | null) || null;

              //Обработчик onChange для документа удостоверения
              const handleSelectChange = (option: SelectOption<IdentityDocument> | null) => {
                clearErrors(FIELD_IDENTITY_DOCUMENT);
                field.onChange(option?.value ?? '');
              };

              return (
                <SelectSingle
                  label="Документ удостоверения"
                  options={normalizedOptions}
                  value={selectedOption}
                  onChange={handleSelectChange}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                  requiredStar
                  placeholder="Выберите документ"
                />
              );
            }}
          />

          {/*Номер паспорта (TextInput) */}
          <Controller
            name={FIELD_PASSPORT_ID}
            control={control}
            rules={{ required: 'Номер паспорта обязателен' }}
            render={({ field, fieldState }) => {
              const handleChange = (newValue: string | number | bigint | null) => {
                clearErrors(FIELD_PASSPORT_ID);
                field.onChange(newValue === null ? '' : newValue);
              };
              return (
                <TextInput
                  label="Номер паспорта:"
                  type="number"
                  value={field.value}
                  onChange={handleChange}
                  required
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              );
            }}
          />

          {/*Дата выдачи паспорта (TextInput) */}
          <Controller
            name={FIELD_PASSPORT_ISSUE_DATE}
            control={control}
            rules={{ required: 'Дата выдачи паспорта обязательна' }}
            render={({ field, fieldState }) => {
              const handleChange = (newValue: string | number | bigint | null) => {
                clearErrors(FIELD_PASSPORT_ISSUE_DATE);
                field.onChange(newValue === null ? '' : newValue);
              };
              return (
                <TextInput
                  label="Дата выдачи паспорта:"
                  type="date"
                  value={formatDate(field.value)}
                  onChange={handleChange}
                  required
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              );
            }}
          />

          {/*Кем выдан паспорт (TextInput) */}
          <Controller
            name={FIELD_PASSPORT_ISSUED}
            control={control}
            rules={{ required: 'Поле "Кем выдан паспорт" обязательно' }}
            render={({ field, fieldState }) => {
              const handleChange = (newValue: string | number | bigint | null) => {
                clearErrors(FIELD_PASSPORT_ISSUED);
                field.onChange(newValue === null ? '' : String(newValue));
              };
              return (
                <TextInput
                  label="Кем выдан паспорт:"
                  type="text"
                  value={field.value ?? ''}
                  onChange={handleChange}
                  required
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              );
            }}
          />

          {/*Дата рождения (TextInput) */}
          <Controller
            name={FIELD_BIRTH_DATE}
            control={control}
            rules={{ required: 'Дата рождения обязательна' }}
            render={({ field, fieldState }) => {
              const handleChange = (newValue: string | number | bigint | null) => {
                clearErrors(FIELD_BIRTH_DATE);
                field.onChange(newValue === null ? '' : newValue);
              };
              return (
                <TextInput
                  label="Дата рождения:"
                  type="date"
                  value={formatDate(field.value)}
                  onChange={handleChange}
                  required
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              );
            }}
          />

          {/*Место рождения (TextInput) */}
          <Controller
            name={FIELD_BIRTH_PLACE}
            control={control}
            rules={{ required: 'Место рождения обязательно' }}
            render={({ field, fieldState }) => {
              const handleChange = (newValue: string | number | bigint | null) => {
                clearErrors(FIELD_BIRTH_PLACE);
                field.onChange(newValue === null ? '' : newValue);
              };
              return (
                <TextInput
                  label="Место рождения:"
                  type="text"
                  value={field.value ?? ''}
                  onChange={handleChange}
                  required
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              );
            }}
          />

          {/*Фактический адрес (TextInput) */}
          <Controller
            name={FIELD_ACTUAL_ADDRESS}
            control={control}
            render={({ field, fieldState }) => {
              const handleChange = (newValue: string | number | bigint | null) => {
                clearErrors(FIELD_ACTUAL_ADDRESS);
                field.onChange(newValue === null ? '' : newValue);
              };
              return (
                <TextInput
                  label="Фактический адрес:"
                  type="text"
                  value={field.value ?? ''}
                  onChange={handleChange}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              );
            }}
          />

          {/*Адрес по прописке (TextInput) */}
          <Controller
            name={FIELD_PERMANENT_ADDRESS}
            control={control}
            rules={{ required: 'Постоянный адрес обязателен' }}
            render={({ field, fieldState }) => {
              const handleChange = (newValue: string | number | bigint | null) => {
                clearErrors(FIELD_PERMANENT_ADDRESS);
                field.onChange(newValue === null ? '' : newValue);
              };
              return (
                <TextInput
                  label="Постоянный адрес:"
                  type="text"
                  value={field.value ?? ''}
                  onChange={handleChange}
                  required
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              );
            }}
          />

          {/*Режим смены (SelectSingle) */}
          <Controller
            name={FIELD_CHANGING_DRIVER}
            control={control}
            rules={{ required: 'Режим смены обязателен' }}
            render={({ field, fieldState }) => {
              //Приводим опции, чтобы label всегда был строкой, аналогично гражданству
              const normalizedOptions: SelectOption<ChangingDriver>[] = changingDriverOptions.map(
                (opt) => ({
                  ...opt,
                  label: opt.label ? String(opt.label) : '',
                }),
              );

              const selectedOption =
                (normalizedOptions.find(
                  (opt) => opt.value === field.value,
                ) as SelectOption<ChangingDriver> | null) || null;

              //Обработчик onChange для режима смены
              const handleSelectChange = (option: SelectOption<ChangingDriver> | null) => {
                clearErrors(FIELD_CHANGING_DRIVER);
                field.onChange(option?.value ?? '');
              };

              return (
                <SelectSingle
                  label="Режим смены"
                  options={normalizedOptions}
                  value={selectedOption}
                  onChange={handleSelectChange}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                  requiredStar
                  placeholder="Выберите режим"
                />
              );
            }}
          />
          <Controller
            name={FIELD_PARTNER_COMPANY}
            control={control}
            defaultValue="NONE"
            rules={{ required: 'Партнер обязателен' }}
            render={({ field, fieldState }) => {
              const selectedOption =
                partnerOptions.find((opt) => opt.value === field.value) || null;

              const handleSelectChange = (option: SelectOption<string> | null) => {
                clearErrors(FIELD_PARTNER_COMPANY);
                field.onChange(option?.value ?? 'NONE');
              };

              return (
                <SelectSingle
                  label="Партнер"
                  options={partnerOptions}
                  value={selectedOption}
                  onChange={handleSelectChange}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                  requiredStar
                  placeholder="Выберите партнера"
                />
              );
            }}
          />

          {/*Новое поле: Индивидуальная ставка */}
          <Controller
            name={FIELD_INDIVIDUAL_SALARY_RATE}
            control={control}
            render={({ field, fieldState }) => {
              const handleChange = (newValue: string | number | null) => {
                clearErrors(FIELD_INDIVIDUAL_SALARY_RATE);
                field.onChange(newValue === null ? '' : Number(newValue) || null);
              };

              return (
                <TextInput
                  label="Индивидуальная ставка:"
                  type="number"
                  value={field.value ?? ''}
                  onChange={handleChange}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                  placeholder="Введите сумму"
                />
              );
            }}
          />
        </div>
      </div>

      {/*Правая колонка — загрузка фото (паспорт, портретное) */}
      <div className="w-1/3 flex flex-col items-center justify-around">
        {/*Фото паспорта */}
        <Controller
          name={FIELD_PASSPORT_IMAGE}
          control={control}
          render={({ field, fieldState }) => (
            <ImageUploadWithCrop
              label="Лицева сторона паспорта:"
              initialSrc={passportPhotoSrc || undefined}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message || ''}
              onChange={(file) => {
                clearErrors(FIELD_PASSPORT_IMAGE);
                field.onChange(file);
                if (setPassportPreview) {
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setPassportPreview(url);
                  } else {
                    setPassportPreview('');
                  }
                }
              }}
              containerWidth={300}
              containerHeight={200}
              aspect={4 / 3}
            />
          )}
        />

        {/*Портретное фото */}
        <Controller
          name={FIELD_DRIVER_PROFILE_IMAGE}
          control={control}
          render={({ field, fieldState }) => (
            <ImageUploadWithCrop
              label="Задняя сторона паспорта:"
              initialSrc={driverProfilePhotoSrc || undefined}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message || ''}
              onChange={(file) => {
                clearErrors(FIELD_DRIVER_PROFILE_IMAGE);
                field.onChange(file);
                if (setDriverProfilePhotoPreview) {
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setDriverProfilePhotoPreview(url);
                  } else {
                    setDriverProfilePhotoPreview('');
                  }
                }
              }}
              containerWidth={300}
              containerHeight={200}
              aspect={4 / 3}
            />
          )}
        />
      </div>
    </div>
  );
};

export default DriverFormStepTwo;
