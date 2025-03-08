import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput, PhoneInput } from '@shared/components/ui/inputs';
import {
  validateEmail,
  validateLength,
  validateNoSpecialChars,
  validatePhoneNumber,
} from '@shared/utils/validations';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import { userFormData } from '@shared/prisma/interfaceForm/user/userFormData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

interface ClientCorpFormStepTwoProps {
  logoImageSrc?: string | null;
  setLogoPreview: (url: string) => void;
}

const ClientCorpFormStepTwo: React.FC<ClientCorpFormStepTwoProps> = ({
  logoImageSrc,
  setLogoPreview,
}) => {
  const { control, clearErrors } = useFormContext<userFormData>();

  return (
    <AnimatedComponent duration={300}>
      <div className="w-full flex flex-col">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <div className="flex flex-row border-b border-gray-100">
            {/* Левая часть - информация о компании */}
            <div className="w-2/3 border-r border-gray-200">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center p-6 border-b">
                  Информация о компании
                </h3>
                <div className="p-6">
                  {/* Название компании и PIN */}
                  <div className="grid grid-cols-2 gap-4">
                    <Controller
                      name="companyProfile.companyName"
                      control={control}
                      defaultValue=""
                      rules={{
                        required: 'Название компании обязательно',
                        validate: (value) =>
                          (validateLength(2, 100)(value) && validateNoSpecialChars(value)) ||
                          'Некорректное название компании',
                      }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Название компании"
                          placeholder="Например: ООО Трансфер Сервис"
                          type="text"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('companyProfile.companyName');
                            field.onChange(newValue ?? '');
                          }}
                          onFocus={() => clearErrors('companyProfile.companyName')}
                          required={true}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                    <Controller
                      name="companyProfile.companyPin"
                      control={control}
                      defaultValue=""
                      rules={{
                        required: 'PIN компании обязателен',
                        validate: (value) =>
                          (validateLength(2, 100)(value ?? '') &&
                            validateNoSpecialChars(value ?? '')) ||
                          'Некорректный PIN компании',
                      }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="PIN компании"
                          placeholder="Введите PIN компании"
                          type="text"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('companyProfile.companyPin');
                            field.onChange(newValue ?? '');
                          }}
                          onFocus={() => clearErrors('companyProfile.companyPin')}
                          required={true}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>

                  {/* Телефон и Email */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Controller
                      name="companyProfile.phone"
                      control={control}
                      defaultValue=""
                      rules={{
                        required: 'Телефон компании обязателен',
                        validate: validatePhoneNumber,
                      }}
                      render={({ field, fieldState }) => (
                        <PhoneInput
                          label="Телефон компании"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('companyProfile.phone');
                            field.onChange(newValue ?? '');
                          }}
                          onFocus={() => clearErrors('companyProfile.phone')}
                          requiredStar={true}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                    <Controller
                      name="companyProfile.email"
                      control={control}
                      defaultValue=""
                      rules={{
                        required: 'Email компании обязателен',
                        validate: validateEmail,
                      }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Email компании"
                          placeholder="company@example.com"
                          type="email"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('companyProfile.email');
                            field.onChange(newValue ?? '');
                          }}
                          onFocus={() => clearErrors('companyProfile.email')}
                          required={true}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>

                  {/* Веб-сайт и Адрес */}
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <Controller
                      name="companyProfile.website"
                      control={control}
                      defaultValue=""
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Веб-сайт компании"
                          placeholder="https://example.com"
                          type="url"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('companyProfile.website');
                            field.onChange(newValue ?? '');
                          }}
                          onFocus={() => clearErrors('companyProfile.website')}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                    <Controller
                      name="companyProfile.address"
                      control={control}
                      defaultValue=""
                      rules={{
                        required: 'Адрес компании обязателен',
                        validate: (value) =>
                          validateLength(5, 200)(value) || 'Адрес компании слишком короткий',
                      }}
                      render={({ field, fieldState }) => (
                        <TextInput
                          label="Юридический адрес"
                          placeholder="г. Бишкек, ул. Гоголя, д. 10"
                          type="text"
                          value={field.value ?? ''}
                          onChange={(newValue) => {
                            clearErrors('companyProfile.address');
                            field.onChange(newValue ?? '');
                          }}
                          onFocus={() => clearErrors('companyProfile.address')}
                          required={true}
                          error={!!fieldState.error}
                          message={fieldState.error?.message || ''}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Правая часть - логотип компании */}
            <div className="w-1/3 bg-gray-50 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Логотип компании</h3>
              <div className="flex flex-col items-center">
                <AnimatedComponent duration={500} className="w-full">
                  <Controller
                    name="companyProfile.logoImagePath"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[400px]">
                        <ImageUploadWithCrop
                          initialImage={logoImageSrc || undefined}
                          required={false}
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message || ''}
                          onChange={(file) => {
                            clearErrors('companyProfile.logoImagePath');
                            field.onChange(file);
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setLogoPreview(url);
                            } else {
                              setLogoPreview('');
                            }
                          }}
                          aspect={1}
                        />
                      </div>
                    )}
                  />
                </AnimatedComponent>
                <p className="text-xs text-gray-500 mt-3">
                  Рекомендуемый размер: не менее 400x400 пикселей. Поддерживаемые форматы: JPG, PNG.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedComponent>
  );
};

export default ClientCorpFormStepTwo;
