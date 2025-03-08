import React from 'react';
import OperatorFormStepOne from '@pages/(administrator)/(users)/user/operator/step/OperatorFormStepOne';
import OperatorFormStepTwo from '@pages/(administrator)/(users)/user/operator/step/OperatorFormStepTwo';

interface OperatorFormProps {
  mode: 'create' | 'edit';
  profilePhotoPath?: string | null;
  logoImageSrc?: string | null;
  currentStep: number;
  setCurrentStep?: React.Dispatch<React.SetStateAction<number>>;
  setImagePreview: (url: string) => void;
  setLogoPreview: (url: string) => void;
}

const OperatorForm: React.FC<OperatorFormProps> = ({
  mode,
  profilePhotoPath,
  logoImageSrc,
  currentStep,
  setImagePreview,
  setLogoPreview,
}) => {
  return (
    <div className="">
      {/* Контент формы */}
      <div>
        {currentStep === 1 && (
          <OperatorFormStepOne
            profilePhotoPath={profilePhotoPath}
            mode={mode}
            setPreview={setImagePreview}
          />
        )}
        {currentStep === 2 && (
          <OperatorFormStepTwo logoImageSrc={logoImageSrc} setLogoPreview={setLogoPreview} />
        )}
      </div>
    </div>
  );
};

export default OperatorForm;
