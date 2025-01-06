'use client';

import React, { JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gender, UserRole } from '@prisma/client';
import { CreateUserData } from '@shared/prisma/interface/users/interface';
import { useForm, FormProvider } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import ClientCorpCreateStep1 from '@pages/(client)/(users)/user/client-corp/step-create/ClientCorpCreateStep1';
import ClientCorpCreateStep2 from '@pages/(client)/(users)/user/client-corp/step-create/ClientCorpCreateStep2';

interface ClientCorpCreateFormProps {
  onSubmit: (formData: CreateUserData) => void;
}

interface FormData extends Omit<CreateUserData, 'gender'> {
  confirmPassword: string;
  lastName: string;
  firstName: string;
  middleName: string;
  gender: Gender | undefined;
}

const ClientCorpCreateForm = ({ onSubmit }: ClientCorpCreateFormProps): JSX.Element => {
  const [step, setStep] = useState(1);
  const methods = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.ClientCorp,
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

  return (
    <div className={'w-full h-full flex flex-col gap-4'}>
      <FormProvider {...methods}>
        <form id="client-corp-create-form" onSubmit={handleSubmit(onSubmitForm)}>
          {step === 1 && <ClientCorpCreateStep1 />}
          {step === 2 && <ClientCorpCreateStep2 />}
        </form>
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
              form="client-corp-create-form"
              className="min-w-[205px] p-4 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
            >
              Создать корпоративного клиента
            </IButton>
          )}
        </div>
      </FormProvider>
    </div>
  );
};

export default ClientCorpCreateForm;
