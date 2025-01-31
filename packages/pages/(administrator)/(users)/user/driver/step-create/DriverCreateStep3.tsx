import React, { JSX } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { NumberInput, ImageUpload } from '@shared/components/ui/inputs';
import { validateOnlyDigits, validateLength } from '@shared/utils/validations';

const DriverCreateStep3 = (): JSX.Element => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-col justify-center">
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.yearsOfDriving"
            control={control}
            rules={{
              required: 'Количество лет вождения обязательно',
              validate: {
                onlyDigits: validateOnlyDigits,
                maxLength: validateLength(2),
              },
            }}
            render={({ field, fieldState }) => (
              <NumberInput
                label="Годы вождения:"
                value={field.value}
                onChange={field.onChange}
                maxLength={2}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <Controller
            name="driverProfile.licensePhotoPath"
            control={control}
            render={({ field, fieldState }) => (
              <ImageUpload
                name={field.name}
                label="Загрузите фотографию лицензии"
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
                value={field.value}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default DriverCreateStep3;
