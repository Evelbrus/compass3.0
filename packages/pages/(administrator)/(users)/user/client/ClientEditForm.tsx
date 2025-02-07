import React, { JSX, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gender } from '@prisma/client';
import { EditUserData } from '@shared/prisma/interface/users/interface';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { ImageUpload, PhoneInput, RadioInput, TextInput } from '@shared/components/ui/inputs';
import { IButton } from '@shared/components/ui/buttons';
import {
  validateLength,
  validateNoSpecialChars,
  validatePhoneNumber,
} from '@shared/utils/validations';

interface ClientEditFormProps {
  userData: EditUserData;
  onSubmit: (formData: EditUserData) => void;
}

interface FormData extends EditUserData {
  lastName: string;
  firstName: string;
  middleName: string;
}

const ClientEditForm = ({ userData, onSubmit }: ClientEditFormProps): JSX.Element => {
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

  const { handleSubmit, control, reset } = methods;
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
    router.push('/users');
  };

  return (
    <div className={'w-full h-full flex flex-col gap-4'}>
      <FormProvider {...methods}>
        <h1 className={'text-6 leading-6 mt-4 mb-2 pl-6 font-extrabold'}>Редактирование Клиента</h1>
        <form
          id="client-edit-form"
          onSubmit={handleSubmit(onSubmitForm)}
          className="flex flex-row p-5 justify-center bg-white border rounded-xl"
        >
          <div className="w-2/3 pr-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
              <div className="mb-4 col-span-1">
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextInput type="email" {...field} readOnly label="Email:" />
                  )}
                />
              </div>
              <div className="mb-4 col-span-1">
                <Controller
                  name="lastName"
                  control={control}
                  rules={{
                    required: 'Поле обязательно для заполнения',
                    validate: (value) =>
                      validateLength(2, 50)(value) && validateNoSpecialChars(value),
                  }}
                  render={({ field, fieldState }) => (
                    <TextInput
                      label="Фамилия:"
                      type="text"
                      {...field}
                      requiredStar={true}
                      error={!!fieldState.error}
                      message={fieldState.error?.message || ''}
                    />
                  )}
                />
              </div>
              <div className="mb-4 col-span-1">
                <Controller
                  name="firstName"
                  control={control}
                  rules={{
                    required: 'Поле обязательно для заполнения',
                    validate: (value) =>
                      validateLength(2, 50)(value) && validateNoSpecialChars(value),
                  }}
                  render={({ field, fieldState }) => (
                    <TextInput
                      label="Имя:"
                      type="text"
                      {...field}
                      requiredStar={true}
                      error={!!fieldState.error}
                      message={fieldState.error?.message || ''}
                    />
                  )}
                />
              </div>
              <div className="mb-4 col-span-1">
                <Controller
                  name="middleName"
                  control={control}
                  rules={{
                    required: 'Поле обязательно для заполнения',
                    validate: (value) =>
                      validateLength(2, 50)(value) && validateNoSpecialChars(value),
                  }}
                  render={({ field, fieldState }) => (
                    <TextInput
                      label="Отчество:"
                      type="text"
                      {...field}
                      requiredStar={true}
                      error={!!fieldState.error}
                      message={fieldState.error?.message || ''}
                    />
                  )}
                />
              </div>
              <div className="mb-4 col-span-1">
                <Controller
                  name="phone"
                  control={control}
                  rules={{ validate: validatePhoneNumber }}
                  render={({ field, fieldState }) => (
                    <PhoneInput
                      label="Номер телефона:"
                      {...field}
                      requiredStar={true}
                      error={!!fieldState.error}
                      message={fieldState.error?.message || ''}
                    />
                  )}
                />
              </div>
              <div className="relative mb-4 col-span-2 flex flex-col gap-2">
                <p className="block text-4 font-medium text-gray-500">Пол:</p>
                <div className="flex flex-row gap-4">
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: 'Выберите пол.' }}
                    render={({ field, fieldState }) => (
                      <div className={'flex flex-row gap-4'}>
                        <RadioInput
                          label="Мужской"
                          checked={field.value === Gender.Male}
                          onChange={() => field.onChange(Gender.Male)}
                          name="gender"
                          requiredStar={true}
                        />
                        <RadioInput
                          label="Женский"
                          checked={field.value === Gender.Female}
                          onChange={() => field.onChange(Gender.Female)}
                          name="gender"
                          requiredStar={true}
                        />
                        <div className={'absolute bottom-[-25px]'}>
                          {fieldState.error && (
                            <p className="text-red-600 text-sm mt-2">{fieldState.error.message}</p>
                          )}
                        </div>
                      </div>
                    )}
                  />
                </div>
              </div>
              <div className="mb-4 col-span-2">
                <Controller
                  name="address"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextInput
                      label="Адрес:"
                      type="text"
                      {...field}
                      value={field.value ?? ''}
                      requiredStar={true}
                      error={!!fieldState.error}
                      message={fieldState.error?.message || ''}
                    />
                  )}
                />
              </div>
            </div>
          </div>
          <div className="w-1/3 flex items-start justify-center p-6">
            <Controller
              name="profilePhotoPath"
              control={control}
              render={({ field, fieldState }) => (
                <ImageUpload
                  {...field}
                  value={field.value ?? undefined}
                  label="Аватар Клиента"
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
          <IButton
            type="submit"
            form="client-edit-form"
            className="min-w-[205px] p-3 bg-[color:var(--button-secondary)]
            text-[color:var(--text-white)] rounded-lg
            hover:bg-[color:var(--button-secondary-hover)] transition"
            textClassName="w-full text-center justify-center"
          >
            Обновить клиента
          </IButton>
        </div>
      </FormProvider>
    </div>
  );
};

export default ClientEditForm;
