import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput, SelectSingle } from '@shared/components/ui/inputs';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import {
  citizenshipOptions,
  partnerOptions,
  identityDocumentOptions,
  changingDriverOptions,
} from '@shared/lib/effector/drivers/optionsTranslation/optionsTranslationDriver';
import { ChangingDriver, Citizenship, IdentityDocument, PartnerCompany } from '@prisma/client';
import { SelectOption } from '@shared/lib/effector';
import { userFormData } from '@shared/prisma/interfaceForm/user/userFormData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

// Интерфейс пропсов
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
  const { control, clearErrors } = useFormContext<userFormData>();

  return (
    <AnimatedComponent duration={300}>
      <div className="w-full flex flex-col">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-row border-b border-gray-100">
            {/* Левая часть - данные водителя */}
            <div className="w-2/3 border-r">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center p-6 border-b">
                  Паспортные данные
                </h3>
                <div className="p-6 space-y-4">
                  {/* Гражданство и документ удостоверения */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="driverProfile.citizenship"
                      control={control}
                      defaultValue={citizenshipOptions[1]?.value || 'KG'}
                      rules={{ required: 'Гражданство обязательно' }}
                      render={({ field, fieldState }) => {
                        const selectedOption =
                          (citizenshipOptions.find(
                            (opt) => opt.value === (field.value as Citizenship),
                          ) as SelectOption<Citizenship> | null) || null;

                        const handleSelectChange = (option: SelectOption<Citizenship> | null) => {
                          clearErrors('driverProfile.citizenship');
                          field.onChange(option?.value ?? '');
                        };

                        return (
                          <SelectSingle
                            label="Гражданство"
                            options={citizenshipOptions}
                            value={selectedOption}
                            onChange={handleSelectChange}
                            onFocus={() => clearErrors('driverProfile.citizenship')}
                            error={!!fieldState.error}
                            message={fieldState.error?.message || ''}
                            requiredStar
                            placeholder="Выберите гражданство"
                          />
                        );
                      }}
                    />
                    <Controller
                      name="driverProfile.identityDocument"
                      control={control}
                      defaultValue={identityDocumentOptions[1]?.value || 'Kyrgyzstan'}
                      rules={{ required: 'Документ удостоверения обязателен' }}
                      render={({ field, fieldState }) => {
                        const normalizedOptions: SelectOption<IdentityDocument>[] =
                          identityDocumentOptions.map((opt) => ({
                            ...opt,
                            label: opt.label ? String(opt.label) : '',
                          }));

                        const selectedOption =
                          (normalizedOptions.find(
                            (opt) => opt.value === (field.value as IdentityDocument),
                          ) as SelectOption<IdentityDocument> | null) || null;

                        const handleSelectChange = (
                          option: SelectOption<IdentityDocument> | null,
                        ) => {
                          clearErrors('driverProfile.identityDocument');
                          field.onChange(option?.value ?? '');
                        };

                        return (
                          <SelectSingle
                            label="Документ удостоверения"
                            options={normalizedOptions}
                            value={selectedOption}
                            onChange={handleSelectChange}
                            onFocus={() => clearErrors('driverProfile.identityDocument')}
                            error={!!fieldState.error}
                            message={fieldState.error?.message || ''}
                            requiredStar
                            placeholder="Выберите документ"
                          />
                        );
                      }}
                    />
                  </div>

                  {/* Номер паспорта и дата выдачи */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="driverProfile.passportId"
                      control={control}
                      rules={{ required: 'Номер паспорта обязателен' }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Номер паспорта"
                          placeholder="Введите номер паспорта"
                          type="number"
                          value={field.value}
                          onChange={(newValue) => {
                            clearErrors('driverProfile.passportId');
                            field.onChange(newValue === null ? '' : newValue);
                          }}
                          onFocus={() => clearErrors('driverProfile.passportId')}
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                    <Controller
                      name="driverProfile.passportIssueDate"
                      control={control}
                      rules={{ required: 'Дата выдачи паспорта обязательна' }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Дата выдачи паспорта"
                          type="date"
                          value={field.value}
                          onChange={(newValue) => {
                            clearErrors('driverProfile.passportIssueDate');
                            field.onChange(newValue === null ? '' : newValue);
                          }}
                          onFocus={() => clearErrors('driverProfile.passportIssueDate')}
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>

                  {/* Кем выдан и дата рождения */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="driverProfile.passportIssued"
                      control={control}
                      rules={{ required: 'Поле "Кем выдан паспорт" обязательно' }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Кем выдан паспорт"
                          placeholder="Укажите орган, выдавший паспорт"
                          type="text"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('driverProfile.passportIssued');
                            field.onChange(newValue === null ? '' : String(newValue));
                          }}
                          onFocus={() => clearErrors('driverProfile.passportIssued')}
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                    <Controller
                      name="driverProfile.birthDate"
                      control={control}
                      rules={{ required: 'Дата рождения обязательна' }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Дата рождения"
                          type="date"
                          value={field.value}
                          onChange={(newValue) => {
                            clearErrors('driverProfile.birthDate');
                            field.onChange(newValue === null ? '' : newValue);
                          }}
                          onFocus={() => clearErrors('driverProfile.birthDate')}
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>

                  {/* Место рождения и адрес проживания */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="driverProfile.birthPlace"
                      control={control}
                      rules={{ required: 'Место рождения обязательно' }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Место рождения"
                          placeholder="Укажите место рождения"
                          type="text"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('driverProfile.birthPlace');
                            field.onChange(newValue === null ? '' : newValue);
                          }}
                          onFocus={() => clearErrors('driverProfile.birthPlace')}
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                    <Controller
                      name="driverProfile.actualAddress"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Фактический адрес"
                          placeholder="Укажите фактический адрес проживания"
                          type="text"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('driverProfile.actualAddress');
                            field.onChange(newValue === null ? '' : newValue);
                          }}
                          onFocus={() => clearErrors('driverProfile.actualAddress')}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>

                  {/* Адрес по прописке и режим смены */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="driverProfile.permanentAddress"
                      control={control}
                      rules={{ required: 'Постоянный адрес обязателен' }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Адрес по прописке"
                          placeholder="Укажите адрес постоянной регистрации"
                          type="text"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('driverProfile.permanentAddress');
                            field.onChange(newValue === null ? '' : newValue);
                          }}
                          onFocus={() => clearErrors('driverProfile.permanentAddress')}
                          required
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                    <Controller
                      name="driverProfile.changingDriver"
                      control={control}
                      rules={{ required: 'Режим смены обязателен' }}
                      render={({ field, fieldState }) => {
                        const normalizedOptions: SelectOption<ChangingDriver>[] =
                          changingDriverOptions.map((opt) => ({
                            ...opt,
                            label: opt.label ? String(opt.label) : '',
                          }));

                        const selectedOption =
                          (normalizedOptions.find(
                            (opt) => opt.value === (field.value as ChangingDriver),
                          ) as SelectOption<ChangingDriver> | null) || null;

                        const handleSelectChange = (
                          option: SelectOption<ChangingDriver> | null,
                        ) => {
                          clearErrors('driverProfile.changingDriver');
                          field.onChange(option?.value ?? '');
                        };

                        return (
                          <SelectSingle
                            label="Режим смены"
                            options={normalizedOptions}
                            value={selectedOption}
                            onChange={handleSelectChange}
                            onFocus={() => clearErrors('driverProfile.changingDriver')}
                            error={!!fieldState.error}
                            message={fieldState.error?.message || ''}
                            requiredStar
                            placeholder="Выберите режим"
                          />
                        );
                      }}
                    />
                  </div>

                  {/* Партнер и индивидуальная ставка */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="partnerCompany"
                      control={control}
                      defaultValue="NONE"
                      rules={{ required: 'Партнер обязателен' }}
                      render={({ field, fieldState }) => {
                        const selectedOption =
                          (partnerOptions.find(
                            (opt) => opt.value === (field.value as PartnerCompany),
                          ) as SelectOption<PartnerCompany> | null) || null;

                        const handleSelectChange = (
                          option: SelectOption<PartnerCompany> | null,
                        ) => {
                          clearErrors('partnerCompany');
                          field.onChange(option?.value ?? 'NONE');
                        };

                        return (
                          <SelectSingle
                            label="Партнер"
                            options={partnerOptions}
                            value={selectedOption}
                            onChange={handleSelectChange}
                            onFocus={() => clearErrors('partnerCompany')}
                            error={!!fieldState.error}
                            message={fieldState.error?.message || ''}
                            requiredStar
                            placeholder="Выберите партнера"
                          />
                        );
                      }}
                    />
                    <Controller
                      name="individualSalaryRate"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Индивидуальная ставка"
                          placeholder="Введите сумму"
                          type="number"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('individualSalaryRate');
                            field.onChange(newValue === null ? '' : Number(newValue) || null);
                          }}
                          onFocus={() => clearErrors('individualSalaryRate')}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Правая часть - фото паспорта */}
            <div className="w-1/3 bg-gray-50 p-6">
              <AnimatedComponent duration={500} className="w-full mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Лицевая сторона паспорта</h3>
                <Controller
                  name="driverProfile.passportPhotoPath"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-2">
                      <ImageUploadWithCrop
                        initialImage={passportPhotoSrc || undefined}
                        error={!!fieldState.error}
                        errorMessage={fieldState.error?.message || ''}
                        onChange={(file) => {
                          clearErrors('driverProfile.passportPhotoPath');
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
                        aspect={4 / 3}
                      />
                    </div>
                  )}
                />
                <p className="text-xs text-gray-500">
                  Рекомендуемый размер: не менее 800x600 пикселей. Поддерживаемые форматы: JPG, PNG.
                </p>
              </AnimatedComponent>

              <AnimatedComponent duration={500} className="w-full">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Задняя сторона паспорта</h3>
                <Controller
                  name="driverProfile.profilePhotoPath"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm mb-2">
                      <ImageUploadWithCrop
                        initialImage={driverProfilePhotoSrc || undefined}
                        error={!!fieldState.error}
                        errorMessage={fieldState.error?.message || ''}
                        onChange={(file) => {
                          clearErrors('driverProfile.profilePhotoPath');
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
                        aspect={4 / 3}
                      />
                    </div>
                  )}
                />
                <p className="text-xs text-gray-500">
                  Рекомендуемый размер: не менее 800x600 пикселей. Поддерживаемые форматы: JPG, PNG.
                </p>
              </AnimatedComponent>
            </div>
          </div>
        </div>
      </div>
    </AnimatedComponent>
  );
};

export default DriverFormStepTwo;
