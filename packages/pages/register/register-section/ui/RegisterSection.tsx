'use client';

import React, { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
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
  const [currentStep, setCurrentStep] = useState<number>(1);
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  const validateStepOne = () => {
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

    return valid;
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setLoading(true);
    clearErrors();

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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = result.message || 'Ошибка регистрации.';
        showToast.error(errorMessage); //Покажем сообщение через Toast
        if (currentStep === 1) {
          setError('email', { type: 'server', message: errorMessage });
        } else {
          setError('companyName', { type: 'server', message: errorMessage });
        }
        throw new Error(errorMessage); //Пробросим ошибку для catch
      }

      showToast.success('Регистрация прошла успешно!');
      const signInResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      const signInResult = await signInResponse.json();

      if (!signInResponse.ok) {
        const errorMessage = signInResult.message || 'Ошибка авторизации.';
        showToast.error(errorMessage);
        throw new Error(errorMessage);
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
        showToast.error(error.message);
      } else {
        console.error('Неизвестная ошибка:', error);
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
    if (validateStepOne()) {
      setCurrentStep(2);
      clearErrors();
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    clearErrors();
  };

  const handleChange = () => {
    clearErrors();
  };

  const renderInput = (name: string, placeholder: string, type: string | undefined = 'text') => (
    <Controller
      name={name}
      control={control}
      rules={{ required: `Введите ${placeholder}.` }}
      render={({ field }) => (
        <div className="flex flex-col">
          <TextInput
            {...field}
            value={field.value || ''}
            placeholder={placeholder}
            type={type}
            error={!!errors[name as keyof FormValues]}
            disabled={loading}
            aria-invalid={!!errors[name as keyof FormValues]}
            onChange={(value: string) => {
              field.onChange(value);
              handleChange();
            }}
            className="rounded-lg"
          />
        </div>
      )}
    />
  );

  return (
    <div className="relative inset-0 w-full flex items-center justify-center transition-all bg-[color(--background)] z-50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white p-12 rounded-lg w-full max-w-[500px] relative"
      >
        <form
          ref={formRef}
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col"
          aria-live="polite"
        >
          <h2 className="mb-4 text-center text-2xl font-semibold text-gray-800">
            Регистрация - Шаг {currentStep}
          </h2>

          {currentStep === 1 && (
            <div className={'flex flex-col gap-8'}>
              {renderInput('email', 'Введите email')}
              {renderInput('password', 'Введите пароль', 'password')}
              {renderInput('confirmPassword', 'Повторите пароль', 'password')}
              {renderInput('fullName', 'Введите ваше полное имя')}
              {renderInput('phone', 'Введите номер телефона')}
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
              {renderInput('companyName', 'Введите название компании')}
              {renderInput('companyPin', 'Введите ИНН/ПИН компании')}
              {renderInput('address', 'Введите адрес')}
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
            <p>У меня есть учетная запись! </p>
            <IButton
              type="button"
              onClick={navigateToLogin}
              className="text-sm text-right text-black hover:underline"
            >
              Войти
            </IButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterSection;
