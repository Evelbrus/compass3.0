import React from 'react';
import { IButton } from '@shared/components/ui/buttons';

interface FormNavigationButtonsProps {
  activeTab: string;
  mode: 'create' | 'edit';
  isLastStep: boolean;
  entityName: string;
  onPrevStep: () => void;
  onNextStep: () => void;
  onCancel: () => void;
  onFinish: () => void;
  customFinishButtonText?: string;
}

const FormNavigationButtons: React.FC<FormNavigationButtonsProps> = ({
  activeTab,
  mode,
  isLastStep,
  entityName,
  onPrevStep,
  onNextStep,
  onCancel,
  onFinish,
  customFinishButtonText,
}) => {
  const getFinishButtonText = () => {
    if (customFinishButtonText) {
      return customFinishButtonText;
    }
    return mode === 'create' ? `Создать ${entityName}` : 'Сохранить изменения';
  };

  const isFirstStep = activeTab === '1';
  const isOnlyStep = isFirstStep && isLastStep;

  return (
    <div className="flex justify-end p-4 gap-4">
      {isOnlyStep ? (
        <>
          <IButton
            type="button"
            onClick={onCancel}
            className="w-[200px] p-4 border border-[#E2E8F0] shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Отмена
          </IButton>
          <IButton
            type="button"
            onClick={onFinish}
            className="w-[200px] inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {getFinishButtonText()}
          </IButton>
        </>
      ) : (
        <>
          {!isFirstStep && (
            <IButton
              type="button"
              onClick={onPrevStep}
              className="w-[200px] p-4 border border-[#E2E8F0] shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Назад
            </IButton>
          )}
          {isFirstStep ? (
            <>
              <IButton
                type="button"
                onClick={onCancel}
                className="w-[200px] p-4 border border-[#E2E8F0] shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Отмена
              </IButton>
              <IButton
                type="button"
                onClick={onNextStep}
                className="w-[200px] inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Далее
              </IButton>
            </>
          ) : (
            <IButton
              type="button"
              onClick={isLastStep ? onFinish : onNextStep}
              className="w-[200px] inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLastStep ? getFinishButtonText() : 'Далее'}
            </IButton>
          )}
        </>
      )}
    </div>
  );
};

export default FormNavigationButtons;
