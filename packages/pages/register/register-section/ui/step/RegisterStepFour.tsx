'use client';

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import { UserRegisterCard } from '@pages/register/register-section/ui/RegisterSection';

interface RegisterStepFourProps {
  previewLogo?: string;
  setPreviewLogo: (url: string | undefined) => void;
}

const RegisterStepFour: React.FC<RegisterStepFourProps> = ({ previewLogo, setPreviewLogo }) => {
  const { control, clearErrors } = useFormContext<UserRegisterCard>();

  return (
    <div>
      <Controller
        name="companyProfile.logoImage"
        control={control}
        render={({ field, fieldState }) => (
          <div>
            <ImageUploadWithCrop
              label="Логотип компании"
              initialSrc={previewLogo}
              required={false}
              error={!!fieldState.error}
              errorMessage={fieldState.error?.message || ''}
              onChange={(file: File | null) => {
                clearErrors('companyProfile.logoImage');
                field.onChange(file);
                //Если выбран новый файл, создаём URL для предпросмотра; иначе сбрасываем его
                if (file && file instanceof File) {
                  const url = URL.createObjectURL(file);
                  setPreviewLogo(url);
                } else {
                  setPreviewLogo(undefined);
                }
              }}
              containerWidth={400}
              containerHeight={350}
              aspect={1}
            />
            {fieldState.error && <p className="text-red-500 text-sm">{fieldState.error.message}</p>}
          </div>
        )}
      />
    </div>
  );
};

export default RegisterStepFour;
