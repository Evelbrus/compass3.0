import React, { JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gender, UserRole } from '@prisma/client';
import { CreateUserData } from '@shared/prisma/interface/users/interface';
import { useForm, FormProvider } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import OperatorCreateStep1 from '@pages/(administrator)/(users)/user/operator/step-create/OperatorCreateStep1';
import OperatorCreateStep2 from '@pages/(administrator)/(users)/user/operator/step-create/OperatorCreateStep2';

interface OperatorCreateFormProps {
  onSubmit: (formData: CreateUserData) => void;
}

interface FormData extends Omit<CreateUserData, 'gender'> {
  confirmPassword: string;
  lastName: string;
  firstName: string;
  middleName: string;
  gender: Gender | undefined;
}

const OperatorCreateForm = ({ onSubmit }: OperatorCreateFormProps): JSX.Element => {
  const [step, setStep] = useState(1);
  const methods = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.Operator,
      availability: true,
      lastName: '',
      firstName: '',
      middleName: '',
      phone: '',
      gender: undefined,
      address: '',
      profilePhotoPath: '',
      companyProfile: {
        companyName: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        companyPin: '',
      },
    },
  });

  const { handleSubmit, trigger } = methods;
  const router = useRouter();

  //Функция для обработки данных формы при отправке
  const onSubmitForm = (data: FormData) => {
    const { confirmPassword, lastName, firstName, middleName, gender, companyProfile, ...rest } =
      data;
    const fullName = `${lastName} ${firstName} ${middleName}`;
    const createUserData: CreateUserData = {
      ...rest,
      fullName,
      gender: gender ?? Gender.Male,
      companyProfile,
    };
    onSubmit(createUserData);
  };

  //Функция для обработки кнопки "Назад"
  const handleBack = () => {
    if (step === 1) {
      router.push('/users');
    } else {
      setStep(step - 1);
    }
  };

  //Функция для перехода на следующий шаг с проверкой валидации
  const handleNext = async () => {
    const valid = await trigger();
    if (valid) {
      setStep(step + 1);
    }
  };

  //Массив шагов
  const steps = ['Аккаунт', 'Личная информация оператора'];

  return (
    <div className={'w-full h-full flex flex-col gap-4'}>
      <h1 className={'text-6 leading-6 mt-4 mb-2 pl-6 font-extrabold'}>Создание Оператора</h1>
      <FormProvider {...methods}>
        <div className="p-5 justify-center bg-white border rounded-xl">
          <form id="operator-create-form" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="flex justify-start gap-2 mb-4">
              {steps.map((label, index) => (
                <div
                  key={index}
                  className={`p-2 border-2 ${
                    step === index + 1
                      ? 'border-t-0 border-x-0 border-b-blue-500'
                      : 'border-t-0 border-x-0 border-b-white'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
            {step === 1 && <OperatorCreateStep1 />}
            {step === 2 && <OperatorCreateStep2 />}
          </form>
        </div>
        <div className={'w-full flex justify-end gap-4 p-6'}>
          <IButton
            type="button"
            className="w-[205px] p-3 bg-gray-500 opacity-50 text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
            textClassName="w-full text-center justify-center"
            onClick={handleBack}
          >
            Назад
          </IButton>
          {step === 1 && (
            <IButton
              type="button"
              className="w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
              onClick={handleNext}
            >
              Далее
            </IButton>
          )}
          {step === 2 && (
            <IButton
              type="submit"
              form="operator-create-form"
              className="min-w-[205px] p-4 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
            >
              Создать оператора
            </IButton>
          )}
        </div>
      </FormProvider>
    </div>
  );
};

export default OperatorCreateForm;
