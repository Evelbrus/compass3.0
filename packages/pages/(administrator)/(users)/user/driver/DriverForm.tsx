import React from 'react';
import DriverFormStepOne from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepOne';
import DriverFormStepTwo from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepTwo';
import DriverFormStepThree from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepThree';
import DriverFormStepFour from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepFour';
import DriverFormStepFive from '@pages/(administrator)/(users)/user/driver/step/DriverFormStepFive';

interface DriverFormProps {
  mode: 'create' | 'edit';
  profilePhotoPath?: string | null;
  driverProfilePhotoSrc?: string | null;
  passportPhotoSrc?: string | null;
  licenseSrc?: string | null;
  currentStep: number;
  setCurrentStep?: React.Dispatch<React.SetStateAction<number>>;
  setImagePreview: (url: string) => void;
  setDriverProfilePhotoPreview: (url: string) => void;
  setPassportPreview: (url: string) => void;
  setLicensePreview: (url: string) => void;
}

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
    <div className="">
      {/* Контент формы */}
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
