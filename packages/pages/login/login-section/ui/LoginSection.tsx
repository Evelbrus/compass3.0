'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { showToast } from '@shared/components/toast/ToastManager';
import { IButton } from '@shared/components/ui/buttons';
import { TextInput } from '@shared/components/ui/inputs';
import { FormValues } from '@pages/login/login-section/types/types';
import { WelcomeIcon } from '@shared/components/ui/icon';

const LoginSection: React.FC = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      username: '',
      password: '',
    },
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successLogin, setSuccessLogin] = useState<boolean>(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    clearErrors();
    setGeneralError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.username,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Ошибка авторизации');
      }

      showToast.success('Вход выполнен успешно!');
      setSuccessLogin(true);

      //Перенаправление с учетом сессии
      setTimeout(() => {
        router.push('/');
      }, 2500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Ошибка:', error.message);
        setGeneralError(error.message);
        showToast.error(error.message);
      } else {
        console.error('Неизвестная ошибка:', error);
        setGeneralError('Ошибка сервера');
        showToast.error('Ошибка сервера');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showToast.info('Функционал восстановления пароля в разработке.');
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  if (successLogin) {
    return (
      <div className="w-full h-full">
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white z-50">
          <WelcomeIcon />
        </div>
      </div>
    );
  }

  return (
    <div className="relative inset-0 w-full flex items-center justify-center transition-all bg-[color(--background)] z-50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        className="bg-white p-12 rounded-lg w-full max-w-[500px] relative"
      >
        <form className="w-full flex flex-col" aria-live="polite" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-center font-semibold text-2xl text-gray-800 mb-4">Вход</h2>

          <Controller
            name="username"
            control={control}
            rules={{
              required: 'Введите email.',
            }}
            render={({ field }) => (
              <div className="flex flex-col">
                <TextInput
                  {...field}
                  error={!!errors.username}
                  disabled={loading}
                  placeholder="Введите email"
                />
                <p className="text-sm text-red-500 min-h-[20px] my-1">{errors.username?.message}</p>
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
                message: 'Минимальная длина пароля 6 символов.',
              },
            }}
            render={({ field }) => (
              <div className="flex flex-col">
                <TextInput
                  {...field}
                  type="password"
                  error={!!errors.password}
                  disabled={loading}
                  placeholder="Введите пароль"
                />
                <p className="text-sm text-red-500 min-h-[20px] my-1">{errors.password?.message}</p>
              </div>
            )}
          />

          <IButton
            type="button"
            onClick={handleForgotPassword}
            className="w-full text-sm text-right text-black hover:underline my-2"
            textClassName="w-full text-end justify-end"
          >
            Забыли пароль?
          </IButton>

          {generalError && <p className="text-sm text-red-500">{generalError}</p>}

          <IButton
            type="submit"
            aria-busy={loading}
            disabled={loading}
            className="h-16 px-6 py-3 bg-[color:var(--button-secondary)]
            text-[color:var(--text-white)] rounded-lg
            hover:bg-[color:var(--button-secondary-hover)] transition"
            textClassName="w-full text-center justify-center"
          >
            Войти
          </IButton>

          <div className="flex justify-center text-sm my-2">
            <p>У вас еще нет аккаунта?&nbsp;</p>
            <IButton
              type="button"
              onClick={navigateToRegister}
              className="text-sm text-right text-black hover:underline"
            >
              Зарегистрируйтесь
            </IButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginSection;
