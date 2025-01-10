'use client';

import React, { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EditUserData } from '@shared/prisma/interface/users/interface';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { ImageUpload } from '@shared/components/ui/inputs';
import { IButton } from '@shared/components/ui/buttons';
import OperatorEditStep1 from '@pages/(administrator)/(users)/user/operator/step-edit/OperatorEditStep1';
import OperatorEditStep2 from '@pages/(administrator)/(users)/user/operator/step-edit/OperatorEditStep2';

interface OperatorEditFormProps {
  userData: EditUserData;
  onSubmit: (formData: EditUserData) => void;
}

interface FormData extends EditUserData {
  lastName: string;
  firstName: string;
  middleName: string;
}

const OperatorEditForm = ({ userData, onSubmit }: OperatorEditFormProps): JSX.Element => {
  //Разбиваем fullName на отдельные части
  const [lastName, firstName, middleName] = userData.fullName.split(' ');

  const methods = useForm<FormData>({
    defaultValues: {
      ...userData,
      lastName: lastName || '',
      firstName: firstName || '',
      middleName: middleName || '',
    },
  });
  const [step, setStep] = useState(1);
  const { handleSubmit, control, reset, trigger } = methods;
  const router = useRouter();

  //Обновляем значения формы при изменении userData
  useEffect(() => {
    const [lastName, firstName, middleName] = userData.fullName.split(' ');
    reset({
      ...userData,
      lastName: lastName || '',
      firstName: firstName || '',
      middleName: middleName || '',
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

  return (
    <div className={'w-full h-full flex flex-col gap-4'}>
      <FormProvider {...methods}>
        <form
          id="operator-edit-form"
          onSubmit={handleSubmit(onSubmitForm)}
          className="flex flex-row p-5 justify-center bg-white border rounded-xl"
        >
          <div className="w-2/3 pr-4">
            <h1 className={'text-6 leading-6 mt-4 mb-2 pl-6 font-extrabold'}>
              Редактирование Оператора
            </h1>
            {step === 1 && <OperatorEditStep1 />}
            {step === 2 && <OperatorEditStep2 />}
          </div>
          <div className="w-1/3 flex items-start justify-center p-6">
            <Controller
              name="profilePhotoPath"
              control={control}
              render={({ field, fieldState }) => (
                <ImageUpload
                  {...field}
                  value={field.value ?? undefined}
                  label="Аватар Оператора"
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                />
              )}
            />
          </div>
        </form>
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
              form="operator-edit-form"
              className="min-w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
            >
              Обновить оператора
            </IButton>
          )}
        </div>
      </FormProvider>
    </div>
  );
};

export default OperatorEditForm;
