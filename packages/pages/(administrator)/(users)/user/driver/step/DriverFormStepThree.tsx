import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { UserCard } from '@pages/(administrator)/(users)/user/useClientsAdminForm';
import { TextInput } from '@shared/components/ui/inputs';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';

//Константы для имен полей:
const FIELD_YEARS_OF_DRIVING = 'driverProfile.yearsOfDriving';
const FIELD_LICENSE_IMAGE = 'driverProfile.licenseImage';

interface DriverFormStepThreeProps {
  licenseSrc?: string | null;
  setLicensePreview?: (url: string) => void;
}

const DriverFormStepThree: React.FC<DriverFormStepThreeProps> = ({
  licenseSrc,
  setLicensePreview,
}) => {
  const { control, clearErrors } = useFormContext<UserCard>();

  return (
    <div className="flex flex-row justify-center">
      {/*Левая колонка — стаж вождения */}
      <div className="w-2/3">
        <h3 className="text-lg font-semibold px-6 mt-4">Стаж вождения и техпаспорт</h3>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 p-6">
          {/*Стаж вождения (лет) */}
          <Controller
            name={FIELD_YEARS_OF_DRIVING}
            control={control}
            rules={{
              required: 'Стаж вождения обязателен',
              min: {
                value: 0,
                message: 'Стаж не может быть отрицательным',
              },
            }}
            render={({ field, fieldState }) => {
              //Изменён тип параметра handleChange
              const handleChange = (newValue: string | number | null) => {
                clearErrors(FIELD_YEARS_OF_DRIVING);
                field.onChange(newValue === null ? '' : Number(newValue) || null);
              };

              return (
                <TextInput
                  label="Стаж вождения (лет):"
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
        </div>
      </div>

      {/*Правая колонка — изображение техпаспорта */}
      <div className="w-1/3 flex flex-col items-center justify-start">
        <Controller
          name={FIELD_LICENSE_IMAGE}
          control={control}
          render={({ field, fieldState }) => (
            <ImageUploadWithCrop
              label="Фото технического паспорта:"
              initialSrc={licenseSrc || undefined}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message || ''}
              onChange={(file) => {
                clearErrors(FIELD_LICENSE_IMAGE);
                field.onChange(file);

                //Обновляем превью, если файл выбран
                if (file && setLicensePreview) {
                  const url = URL.createObjectURL(file);
                  setLicensePreview(url);
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

export default DriverFormStepThree;
