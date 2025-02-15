import React from 'react';

import DriverFormStepOne from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepOne';
import DriverFormStepTwo from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepTwo';
import DriverFormStepThree from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepThree';
import DriverFormStepFour from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepFour';
import DriverFormStepFive from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepFive';

import { cn } from '@shared/lib';

interface DriverFormProps {
  mode: 'create' | 'edit';
  profilePhotoPath?: string | null;
  driverProfilePhotoSrc?: string | null;
  passportPhotoSrc?: string | null;
  licenseSrc?: string | null;
  currentStep: number;
  setImagePreview: (url: string) => void;
  setDriverProfilePhotoPreview: (url: string) => void;
  setPassportPreview: (url: string) => void;
  setLicensePreview: (url: string) => void;
}

const steps = [
  'Основная информация',
  'Паспортные данные',
  'Стаж вождения',
  'опыт работы',
  'Банковские реквизиты',
];

const DriverForm: React.FC<DriverFormProps> = ({
  mode,
  profilePhotoPath,
  driverProfilePhotoSrc,
  passportPhotoSrc,
  licenseSrc,
  currentStep,
  setImagePreview,
  setDriverProfilePhotoPreview,
  setPassportPreview,
  setLicensePreview,
}) => {
  return (
    <div className="p-5 bg-white border rounded-xl">
      {/*Навигация по шагам */}
      <div className="flex justify-start gap-x-6 border-b overflow-auto">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              'text-4 font-medium p-2 text-center transition-all duration-300',
              currentStep === index + 1
                ? 'border-b-2 border-blue-500 text-blue-600 font-semibold'
                : 'text-gray-500',
            )}
          >
            {step}
          </div>
        ))}
      </div>

      {/*Контент формы */}
      <div>
        {currentStep === 1 && (
          <DriverFormStepOne
            profilePhotoPath={profilePhotoPath}
            setImagePreview={setImagePreview}
            mode={mode}
          />
        )}
        {currentStep === 2 && (
          <DriverFormStepTwo
            passportPhotoSrc={passportPhotoSrc}
            driverProfilePhotoSrc={driverProfilePhotoSrc}
            setPassportPreview={setPassportPreview}
            setDriverProfilePhotoPreview={setDriverProfilePhotoPreview}
          />
        )}
        {currentStep === 3 && (
          <DriverFormStepThree licenseSrc={licenseSrc} setLicensePreview={setLicensePreview} />
        )}
        {currentStep === 4 && <DriverFormStepFour mode={mode} />}
        {currentStep === 5 && <DriverFormStepFive />}
      </div>
    </div>
  );
};

export default DriverForm;
