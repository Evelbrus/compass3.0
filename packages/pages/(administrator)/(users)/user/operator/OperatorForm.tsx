import React from 'react';
import OperatorFormStepOne from '@pages/(administrator)/(users)/user/operator/step/OperatorFormStepOne';
import OperatorFormStepTwo from '@pages/(administrator)/(users)/user/operator/step/OperatorFormStepTwo';
import { cn } from '@shared/lib';

interface OperatorFormProps {
  mode: 'create' | 'edit';
  profilePhotoPath?: string | null;
  logoImageSrc?: string | null;
  currentStep: number;
  setImagePreview: (url: string) => void;
  setLogoPreview: (url: string) => void;
}

const steps = ['Основная информация', 'Логотип'];

const OperatorForm: React.FC<OperatorFormProps> = ({
  mode,
  profilePhotoPath,
  logoImageSrc,
  currentStep,
  setImagePreview,
  setLogoPreview,
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
