import React from 'react';
import ClientCorpFormStepOne from '@pages/(administrator)/(users)/user/client-corp/step/ClientCorpFormStepOne';
import ClientCorpFormStepTwo from '@pages/(administrator)/(users)/user/client-corp/step/ClientCorpFormStepTwo';

interface ClientCorpFormProps {
  mode: 'create' | 'edit';
  profilePhotoPath?: string | null;
  logoImageSrc?: string | null;
  currentStep: number;
  setCurrentStep?: React.Dispatch<React.SetStateAction<number>>;
  setImagePreview: (url: string) => void;
  setLogoPreview: (url: string) => void;
}

const ClientCorpForm: React.FC<ClientCorpFormProps> = ({
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
          <ClientCorpFormStepOne
            profilePhotoPath={profilePhotoPath}
            mode={mode}
            setPreview={setImagePreview}
          />
        )}
        {currentStep === 2 && (
          <ClientCorpFormStepTwo logoImageSrc={logoImageSrc} setLogoPreview={setLogoPreview} />
        )}
      </div>
    </div>
  );
};

export default ClientCorpForm;
