'use client';

import React, { useState, useCallback, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';
import { showToast } from '@shared/components/toast/ToastManager';
import { IButton } from '@shared/components/ui/buttons';
import { Checkbox, TextInput, RadioInput } from '@shared/components/ui/inputs';
import { Gender } from '@prisma/client';

interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  companyName: string;
  companyPin: string;
  phone: string;
  address: string;
  gender: Gender | undefined;
  isAgree: boolean;
}

const RegisterSection: React.FC = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    clearErrors,
    formState: { errors },
    watch,
    getValues,
    setError,
  } = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      fullName: '',
      companyName: '',
      companyPin: '',
      phone: '',
      address: '',
      gender: undefined,
      isAgree: false,
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  const handleChange = () => {
    clearErrors();
    setGeneralError(null);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    clearErrors();
    setGeneralError(null);

    const { email, password, fullName, companyName, companyPin, phone, address, gender } = data;

    const requestData = {
      email,
      password,
      fullName,
      companyName,
      companyPin,
      phone,
      address,
      gender,
    };

    try {
      //Отправка данных на сервер для регистрации
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка регистрации.');
      }

      showToast.success('Регистрация прошла успешно!');

      //Автоматический вход после успешной регистрации
      const signInResponse = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResponse?.error) {
        throw new Error(signInResponse.error);
      }

      showToast.success('Вход выполнен успешно!');
      setTimeout(() => {
        const redirectPath = localStorage.getItem('redirectPath') || '/';
        router.push(redirectPath);
        localStorage.removeItem('redirectPath');
      }, 2000);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Ошибка:', error.message);
        setGeneralError(error.message);
        showToast.error(error.message);
      } else {
        console.error('Неизвестная ошибка:', error);
        setGeneralError('Произошла неизвестная ошибка. Попробуйте позже.');
        showToast.error('Произошла неизвестная ошибка. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = useCallback(() => {
    router.push('/login');
  }, [router]);

  const handleNextStep = () => {
    const { email, password, confirmPassword, fullName, phone, gender } = getValues();
    let valid = true;

    if (!email) {
      setError('email', { type: 'required', message: 'Введите email.' });
      valid = false;
    }

    if (!password) {
      setError('password', { type: 'required', message: 'Введите пароль.' });
      valid = false;
    } else if (password.length < 6) {
      setError('password', {
        type: 'minLength',
        message: 'Пароль должен содержать минимум 6 символов.',
      });
      valid = false;
    }

    if (!confirmPassword) {
      setError('confirmPassword', {
        type: 'required',
        message: 'Подтвердите пароль.',
      });
      valid = false;
    } else if (confirmPassword !== password) {
      setError('confirmPassword', {
        type: 'validate',
        message: 'Пароли не совпадают.',
      });
      valid = false;
    }

    if (!fullName) {
      setError('fullName', {
        type: 'required',
        message: 'Введите ваше полное имя.',
      });
      valid = false;
    }

    if (!phone) {
      setError('phone', {
        type: 'required',
        message: 'Введите номер телефона.',
      });
      valid = false;
    }

    if (!gender) {
      setError('gender', {
        type: 'required',
        message: 'Выберите пол.',
      });
      valid = false;
    }

    if (valid) {
      setCurrentStep(2);
      clearErrors();
      setGeneralError(null);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    clearErrors();
    setGeneralError(null);
  };

  return (
    <div className="relative inset-0 w-full flex items-center justify-center transition-all bg-[color(--background)] z-50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white p-12 rounded-lg w-full max-w-[500px] relative"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col" aria-live="polite">
          <h2 className="mb-4 text-center text-2xl font-semibold text-gray-800">
            Регистрация - Шаг {currentStep}
          </h2>

          {currentStep === 1 && (
            <div className={'flex flex-col gap-8'}>
              <Controller
                name="email"
                control={control}
                rules={{ required: 'Введите email.' }}
                render={({ field }) => (
                  <div className="flex flex-col">
                    <TextInput
                      {...field}
                      value={field.value || ''}
                      placeholder="Введите email"
                      error={!!errors.email}
                      disabled={loading}
                      aria-invalid={!!errors.email}
                      onChange={(value: string) => {
                        field.onChange(value);
                        handleChange();
                      }}
                      className="rounded-lg"
                    />
                  </div>
                )}
              />
              <Controller
                name="password"
                control={control}
                rules={{
                  required: 'Введите пароль.',
                  minLength: {
                    value: 6,
                    message: 'Пароль должен содержать минимум 6 символов.',
                  },
                }}
                render={({ field }) => (
                  <div className="flex flex-col">
                    <TextInput
                      {...field}
                      value={field.value || ''}
                      placeholder="Введите пароль"
                      type="password"
                      error={!!errors.password}
                      disabled={loading}
                      aria-invalid={!!errors.password}
                      onChange={(value: string) => {
                        field.onChange(value);
                        handleChange();
                      }}
                      className="rounded-lg"
                    />
                  </div>
                )}
              />
              <Controller
                name="confirmPassword"
                control={control}
                rules={{
                  required: 'Подтвердите пароль.',
                  validate: (value) => value === watch('password') || 'Пароли не совпадают.',
                }}
                render={({ field }) => (
                  <div className="flex flex-col">
                    <TextInput
                      {...field}
                      value={field.value || ''}
                      placeholder="Повторите пароль"
                      type="password"
                      error={!!errors.confirmPassword}
                      disabled={loading}
                      aria-invalid={!!errors.confirmPassword}
                      onChange={(value: string) => {
                        field.onChange(value);
                        handleChange();
                      }}
                      className="rounded-lg"
                    />
                  </div>
                )}
              />
              <Controller
                name="fullName"
                control={control}
                rules={{
                  required: 'Введите ваше полное имя.',
                }}
                render={({ field }) => (
                  <div className="flex flex-col">
                    <TextInput
                      {...field}
                      value={field.value || ''}
                      placeholder="Введите ваше полное имя"
                      error={!!errors.fullName}
                      disabled={loading}
                      aria-invalid={!!errors.fullName}
                      onChange={(value: string) => {
                        field.onChange(value);
                        handleChange();
                      }}
                      className="rounded-lg"
                    />
                  </div>
                )}
              />
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: 'Введите номер телефона.',
                }}
                render={({ field }) => (
                  <div className="flex flex-col">
                    <TextInput
                      {...field}
                      value={field.value || ''}
                      placeholder="Введите номер телефона"
                      error={!!errors.phone}
                      disabled={loading}
                      aria-invalid={!!errors.phone}
                      onChange={(value: string) => {
                        field.onChange(value);
                        handleChange();
                      }}
                      className="rounded-lg"
                    />
                  </div>
                )}
              />
              <div className="flex flex-col">
                <p className="text-sm font-semibold">Пол:</p>
                <div className={'flex flex-row gap-4'}>
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: 'Выберите пол.' }}
                    render={({ field }) => (
                      <>
                        <RadioInput
                          label="Мужской"
                          checked={field.value === 'Male'}
                          onChange={() => {
                            field.onChange('Male');
                            handleChange();
                          }}
                          name="gender"
                          required
                        />
                        <RadioInput
                          label="Женский"
                          checked={field.value === 'Female'}
                          onChange={() => {
                            field.onChange('Female');
                            handleChange();
                          }}
                          name="gender"
                          required
                        />
                      </>
                    )}
                  />
                </div>
              </div>
              <IButton
                type="button"
                aria-busy={loading}
                disabled={loading}
                onClick={handleNextStep}
                className="w-full h-16 px-6 py-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
                textClassName="w-full text-center justify-center"
              >
                Далее
              </IButton>
            </div>
          )}
          {currentStep === 2 && (
            <>
              <Controller
                name="companyName"
                control={control}
                rules={{
                  required: 'Введите название компании.',
                }}
                render={({ field }) => (
                  <div className="flex flex-col">
                    <TextInput
                      {...field}
                      value={field.value || ''}
                      placeholder="Введите название компании"
                      error={!!errors.companyName}
                      disabled={loading}
                      aria-invalid={!!errors.companyName}
                      onChange={(value: string) => {
                        field.onChange(value);
                        handleChange();
                      }}
                      className="rounded-lg"
                    />
                  </div>
                )}
              />
              <Controller
                name="companyPin"
                control={control}
                rules={{
                  required: 'Введите ИНН/ПИН компании.',
                }}
                render={({ field }) => (
                  <div className="flex flex-col">
                    <TextInput
                      {...field}
                      value={field.value || ''}
                      placeholder="Введите ИНН/ПИН компании"
                      error={!!errors.companyPin}
                      disabled={loading}
                      aria-invalid={!!errors.companyPin}
                      onChange={(value: string) => {
                        field.onChange(value);
                        handleChange();
                      }}
                      className="rounded-lg"
                    />
                  </div>
                )}
              />
              <Controller
                name="address"
                control={control}
                rules={{
                  required: 'Введите адрес.',
                }}
                render={({ field }) => (
                  <div className="flex flex-col">
                    <TextInput
                      {...field}
                      value={field.value || ''}
                      placeholder="Введите адрес"
                      error={!!errors.address}
                      disabled={loading}
                      aria-invalid={!!errors.address}
                      onChange={(value: string) => {
                        field.onChange(value);
                        handleChange();
                      }}
                      className="rounded-lg"
                    />
                  </div>
                )}
              />
              <Controller
                name="isAgree"
                control={control}
                rules={{ required: 'Вы должны согласиться с условиями.' }}
                render={({ field }) => (
                  <div className="flex flex-col">
                    <Checkbox
                      {...field}
                      id="isAgree"
                      label="Я соглашаюсь с условиями"
                      checked={field.value}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        field.onChange(e.target.checked);
                        handleChange();
                      }}
                      error={errors.isAgree}
                      disabled={loading}
                    />
                  </div>
                )}
              />
              <div className="flex justify-between mt-4">
                <IButton
                  type="button"
                  aria-busy={loading}
                  disabled={loading}
                  onClick={handlePrevStep}
                  className="w-[48%] h-16 px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition"
                  textClassName="w-full text-center justify-center"
                >
                  Назад
                </IButton>
                <IButton
                  type="submit"
                  aria-busy={loading}
                  disabled={loading}
                  className="w-[48%] h-16 px-6 py-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
                  textClassName="w-full text-center justify-center"
                >
                  Зарегистрироваться
                </IButton>
              </div>
            </>
          )}
          <div className="flex justify-center text-sm my-2">
            <p>У меня есть учетная запись!&nbsp;</p>
            <IButton
              type="button"
              onClick={navigateToLogin}
              className="text-sm text-right text-black hover:underline"
            >
              Войти
            </IButton>
          </div>
          {generalError && <p className="text-sm text-red-500 text-center">{generalError}</p>}
        </form>
      </div>
    </div>
  );
};

export default RegisterSection;
