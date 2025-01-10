import React, { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EditUserData } from '@shared/prisma/interface/users/interface';
import { useForm, FormProvider } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import ClientCorpEditStep1 from '@pages/(administrator)/(users)/user/client-corp/step-edit/ClientCorpEditStep1';
import ClientCorpEditStep2 from '@pages/(administrator)/(users)/user/client-corp/step-edit/ClientCorpEditStep2';

interface ClientCorpEditFormProps {
  userData: EditUserData;
  onSubmit: (formData: EditUserData) => void;
}

interface FormData extends EditUserData {
  lastName: string;
  firstName: string;
  middleName: string;
}

const ClientCorpEditForm = ({ userData, onSubmit }: ClientCorpEditFormProps): JSX.Element => {
  const methods = useForm<FormData>({
    defaultValues: {
      ...userData,
      lastName: userData.fullName.split(' ')[0] || '',
      firstName: userData.fullName.split(' ')[1] || '',
      middleName: userData.fullName.split(' ')[2] || '',
    },
  });
  const [step, setStep] = useState(1);
  const { handleSubmit, reset, trigger } = methods;
  const router = useRouter();

  //Обновляем значения формы при изменении userData
  useEffect(() => {
    reset({
      ...userData,
      lastName: userData.fullName.split(' ')[0] || '',
      firstName: userData.fullName.split(' ')[1] || '',
      middleName: userData.fullName.split(' ')[2] || '',
    });
  }, [userData, reset]);

  //Функция для обработки данных формы при отправке
  const onSubmitForm = (data: FormData) => {
    const { lastName, firstName, middleName, ...rest } = data;
    const fullName = `${lastName} ${firstName} ${middleName}`;
    onSubmit({ ...rest, fullName });
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
  const steps = ['Аккаунт', 'Личная информация корпоративного клиента'];

  return (
    <div className={'w-full h-full flex flex-col gap-4'}>
      <h1 className={'text-6 leading-6 mt-4 mb-2 pl-6 font-extrabold'}>
        Редактирование Корпоративного Клиента
      </h1>
      <FormProvider {...methods}>
        <div className="p-5 justify-center bg-white border rounded-xl">
          <form id="client-corp-edit-form" onSubmit={handleSubmit(onSubmitForm)}>
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
            {step === 1 && <ClientCorpEditStep1 />}
            {step === 2 && <ClientCorpEditStep2 />}
          </form>
        </div>
        <div className={'w-full flex justify-end gap-4'}>
          <IButton
            type="button"
            className="w-[205px] p-3 bg-gray-500 opacity-50
            text-[color:var(--text-white)] rounded-lg
            hover:bg-[color:var(--button-secondary-hover)] transition"
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
              form="client-corp-edit-form"
              className="min-w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
            >
              Обновить корпоративного клиента
            </IButton>
          )}
        </div>
      </FormProvider>
    </div>
  );
};

export default ClientCorpEditForm;
