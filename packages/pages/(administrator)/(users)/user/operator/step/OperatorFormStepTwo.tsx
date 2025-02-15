import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { UserCard } from '@pages/(administrator)/(users)/user/useClientsAdminForm';
import { TextInput, PhoneInput } from '@shared/components/ui/inputs';
import {
  validateEmail,
  validateLength,
  validateNoSpecialChars,
  validatePhoneNumber,
} from '@shared/utils/validations';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';

interface OperatorFormStepTwoProps {
  setLogoPreview: (url: string) => void;
  logoImageSrc?: string | null;
}

const OperatorFormStepTwo: React.FC<OperatorFormStepTwoProps> = ({
  setLogoPreview,
  logoImageSrc,
}) => {
  const { control, clearErrors } = useFormContext<UserCard>();

  return (
    <div className="flex flex-row justify-center">
      {/*Левая колонка – текстовые поля */}
      <div className="w-2/3">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
          {/*Название компании */}
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
                label="Название компании:"
                type="text"
                value={field.value ?? ''}
                onChange={(newValue) => field.onChange(newValue ?? '')}
                required={true}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />

          {/*Адрес компании */}
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
                label="Адрес компании:"
                type="text"
                value={field.value ?? ''}
                onChange={(newValue) => field.onChange(newValue ?? '')}
                required={true}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />

          {/*Телефон компании */}
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
                label="Телефон компании:"
                value={field.value ?? ''}
                onChange={(newValue) => field.onChange(newValue ?? '')}
                requiredStar={true}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />

          {/*Email компании */}
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
                label="Email компании:"
                type="email"
                value={field.value ?? ''}
                onChange={(newValue) => field.onChange(newValue ?? '')}
                required={true}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />

          {/*Сайт компании */}
          <Controller
            name="companyProfile.website"
            control={control}
            defaultValue=""
            rules={
              {
                //При необходимости можно добавить валидацию сайта
                //Например:
                //validate: (value) =>
                ///^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value) ||
                //'Некорректный URL'
              }
            }
            render={({ field, fieldState }) => (
              <TextInput
                label="Сайт компании:"
                type="url"
                value={field.value ?? ''}
                onChange={(newValue) => field.onChange(newValue ?? '')}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />

          {/*PIN компании */}
          <Controller
            name="companyProfile.companyPin"
            control={control}
            defaultValue=""
            rules={{
              required: 'PIN компании обязателен',
              validate: (value) =>
                (validateLength(2, 100)(value ?? '') && validateNoSpecialChars(value ?? '')) ||
                'Некорректное название компании',
            }}
            render={({ field, fieldState }) => (
              <TextInput
                label="PIN компании:"
                type="text"
                value={field.value ?? ''}
                onChange={(newValue) => field.onChange(newValue ?? '')}
                required={true}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
      </div>

      {/*Правая колонка – загрузка логотипа */}
      <div className="w-1/3 flex flex-col items-center justify-start p-6">
        <Controller
          name="companyProfile.logoImage"
          control={control}
          render={({ field, fieldState }) => (
            <ImageUploadWithCrop
              label="Логотип компании:"
              initialSrc={logoImageSrc || undefined}
              required={false}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message || ''}
              onChange={(file) => {
                clearErrors('companyProfile.logoImage');
                field.onChange(file);
                if (file) {
                  const url = URL.createObjectURL(file);
                  setLogoPreview(url);
                } else {
                  setLogoPreview('');
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

export default OperatorFormStepTwo;
