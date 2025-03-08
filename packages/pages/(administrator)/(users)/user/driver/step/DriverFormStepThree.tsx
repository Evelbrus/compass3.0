import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput } from '@shared/components/ui/inputs';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import { userFormData } from '@shared/prisma/interfaceForm/user/userFormData';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';

interface DriverFormStepThreeProps {
  licenseSrc?: string | null;
  setLicensePreview?: (url: string) => void;
}

const DriverFormStepThree: React.FC<DriverFormStepThreeProps> = ({
  licenseSrc,
  setLicensePreview,
}) => {
  const { control, clearErrors } = useFormContext<userFormData>();

  return (
    <AnimatedComponent duration={300}>
      <div className="w-full flex flex-col">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-row border-b border-gray-100">
            {/* Левая часть - стаж вождения */}
            <div className="w-2/3 border-r">
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center p-6 border-b">
                  Стаж вождения и техпаспорт
                </h3>
                <div className="p-6 space-y-4">
                  {/* Стаж вождения (лет) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <Controller
                        name="driverProfile.yearsOfDriving"
                        control={control}
                        rules={{
                          required: 'Стаж вождения обязателен',
                          min: {
                            value: 0,
                            message: 'Стаж не может быть отрицательным',
                          },
                        }}
                        render={({ field, fieldState }) => (
                          <TextInput
                            label="Стаж вождения (лет)"
                            placeholder="Укажите стаж вождения"
                            type="number"
                            value={field.value ?? ''}
                            onChange={(newValue) => {
                              clearErrors('driverProfile.yearsOfDriving');
                              field.onChange(newValue === null ? '' : Number(newValue) || null);
                            }}
                            onFocus={() => clearErrors('driverProfile.yearsOfDriving')}
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
            </div>

            {/* Правая часть - фото техпаспорта */}
            <div className="w-1/3 bg-gray-50 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Фото технического паспорта</h3>
              <div className="flex flex-col items-center">
                <AnimatedComponent duration={500} className="w-full">
                  <Controller
                    name="driverProfile.licensePhotoPath"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-[300px]">
                        <ImageUploadWithCrop
                          initialImage={licenseSrc || undefined}
                          error={!!fieldState.error}
                          errorMessage={fieldState.error?.message || ''}
                          onChange={(file) => {
                            clearErrors('driverProfile.licensePhotoPath');
                            field.onChange(file);
                            if (setLicensePreview) {
                              if (file) {
                                const url = URL.createObjectURL(file);
                                setLicensePreview(url);
                              } else {
                                setLicensePreview('');
                              }
                            }
                          }}
                          aspect={4 / 3}
                        />
                      </div>
                    )}
                  />
                </AnimatedComponent>
                <p className="text-xs text-gray-500 mt-3">
                  Рекомендуемый размер: не менее 800x600 пикселей. Поддерживаемые форматы: JPG, PNG.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimatedComponent>
  );
};

export default DriverFormStepThree;
