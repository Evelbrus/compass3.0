'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider, FieldPath, UseFormReturn } from 'react-hook-form';
import { showToast } from '@shared/components/toast/ToastManager';
import { IButton } from '@shared/components/ui/buttons';
import { v4 as uuidv4 } from 'uuid';

import RegisterStepOne from '@pages/register/register-section/ui/step/RegisterStepOne';
import RegisterStepTwo from '@pages/register/register-section/ui/step/RegisterStepTwo';
import RegisterStepThree from '@pages/register/register-section/ui/step/RegisterStepThree';
import RegisterStepFour from '@pages/register/register-section/ui/step/RegisterStepFour';

import { CompanyProfile, User } from '@prisma/client';

export interface CompanyRegisterCard extends Omit<CompanyProfile, 'createdAt' | 'updatedAt'> {
  logoImagePath: string | null;
}

export interface UserRegisterCard
  extends Omit<User, 'password' | 'refreshTokens' | 'createdAt' | 'updatedAt'> {
  //Пользователь вводит отдельные поля, но мы сформируем fullName
  firstName?: string;
  lastName?: string;
  middleName?: string;
  password?: string;
  confirmPassword?: string;
  profileImage?: File | null;
  companyProfile?: CompanyRegisterCard & { logoImage?: File | null };
}

const RegisterSection: React.FC = () => {
  const router = useRouter();
  const finalStep = 4;
  const formMethods: UseFormReturn<UserRegisterCard> = useForm<UserRegisterCard>({
    mode: 'onSubmit',
  });
  const { handleSubmit, trigger, watch, getValues } = formMethods;
  const [currentStep, setCurrentStep] = useState<number>(1);
  const firstInputRef = useRef<HTMLInputElement>(null);

  //Состояние предпросмотра логотипа
  const [previewLogo, setPreviewLogo] = useState<string | undefined>(() => {
    const companyProfile = getValues('companyProfile');
    if (companyProfile && companyProfile.logoImagePath) {
      return `/api/images/${encodeURIComponent(
        companyProfile.logoImagePath.split('/').pop()!,
      )}?type=logo`;
    }
    return undefined;
  });

  //Отслеживаем поле logoImage
  const logoFile = watch('companyProfile.logoImage');
  useEffect(() => {
    if (logoFile && logoFile instanceof File) {
      const url = URL.createObjectURL(logoFile);
      setPreviewLogo(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    }
    //Если файл не выбран, оставляем previewLogo как есть (например, при возврате на шаг)
  }, [logoFile]);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  /**
   * Валидация полей для текущего шага.
   */
  const validateStep = async (fields: FieldPath<UserRegisterCard>[]) => {
    const isValid = await trigger(fields);
    if (!isValid) {
      showToast.error('Пожалуйста, заполните все обязательные поля перед переходом.');
    }
    return isValid;
  };

  const handleNextStep = async () => {
    if (currentStep === 1) {
      const fields: FieldPath<UserRegisterCard>[] = ['email', 'password', 'confirmPassword'];
      if (await validateStep(fields)) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const fields: FieldPath<UserRegisterCard>[] = [
        'firstName',
        'lastName',
        'address',
        'phone',
        'gender',
      ];
      if (await validateStep(fields)) {
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      const fields: FieldPath<UserRegisterCard>[] = [
        'companyProfile.companyName',
        'companyProfile.companyPin',
        'companyProfile.email',
        'companyProfile.phone',
        'companyProfile.website',
        'companyProfile.address',
      ];
      if (await validateStep(fields)) {
        setCurrentStep(4);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = handleSubmit(async (data: UserRegisterCard) => {
    //Собираем fullName из полей
    const fullName = `${data.lastName || ''} ${data.firstName || ''}${
      data.middleName ? ' ' + data.middleName : ''
    }`.trim();

    //Приводим email к нижнему регистру
    const emailLower = data.email?.toLowerCase() || '';

    //Формируем объект для регистрации
    const registrationData = { ...data, fullName, email: emailLower };
    if (registrationData.companyProfile) {
      //Удаляем файловое поле, чтобы не отправлять его в JSON
      const { logoImage, ...rest } = registrationData.companyProfile;
      registrationData.companyProfile = { ...rest, logoImagePath: rest.logoImagePath || null };
    }

    try {
      //Сначала отправляем запрос на регистрацию (без файлов)
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!registerResponse.ok) {
        const errorData = await registerResponse.json();
        throw new Error(errorData.message || 'Ошибка регистрации');
      }

      const registerResult = await registerResponse.json();
      //Извлекаем идентификатор пользователя из поля user
      const userId = registerResult.user?.id || registerResult.user?.uuid;
      if (!userId) {
        throw new Error('Ошибка регистрации: не получен идентификатор пользователя');
      }

      //Если файлы есть, отправляем их отдельно
      const formData = new FormData();
      let hasFiles = false;
      if (data.companyProfile && data.companyProfile.logoImage) {
        const logoFilename = `${uuidv4()}-${data.companyProfile.logoImage.name}`;
        formData.append('logoImage', data.companyProfile.logoImage);
        //Передаём путь, по которому сервер сохранит файл
        formData.append('logoImagePath', `/logo/${logoFilename}`);
        formData.append('userId', userId);
        hasFiles = true;
      }
      if (data.profileImage) {
        const profileFilename = `${uuidv4()}-${data.profileImage.name}`;
        formData.append('profileImage', data.profileImage);
        formData.append('profileImagePath', `/avatar/${profileFilename}`);
        formData.append('userId', userId);
        hasFiles = true;
      }
      //Добавьте другие файлы, если необходимо

      if (hasFiles) {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.message || 'Ошибка загрузки изображений');
        }
        const uploadResult = await uploadResponse.json();
      }

      //После регистрации и загрузки файлов выполняем автоматический вход
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        //Используем email (нижнего регистра) и password, введённые пользователем
        body: JSON.stringify({ email: emailLower, password: data.password }),
      });

      if (!loginResponse.ok) {
        const loginError = await loginResponse.json();
        throw new Error(loginError.message || 'Ошибка входа');
      }

      showToast.success('Регистрация и вход выполнены успешно!');
      router.push('/');
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      showToast.error(`Ошибка регистрации: ${error.message}`);
    }
  });

  return (
    <FormProvider {...formMethods}>
      <div className="relative inset-0 w-full flex items-center justify-center transition-all bg-[color(--background)] z-50 px-4">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Регистрация для Партнера
            <br />
            Шаг-{currentStep}
          </h2>
          <form onSubmit={onSubmit}>
            {currentStep === 1 && <RegisterStepOne />}
            {currentStep === 2 && <RegisterStepTwo />}
            {currentStep === 3 && <RegisterStepThree />}
            {currentStep === 4 && (
              //Передаём previewLogo и setPreviewLogo в шаг 4 для работы компонента загрузки логотипа
              <RegisterStepFour previewLogo={previewLogo} setPreviewLogo={setPreviewLogo} />
            )}

            <div className="flex flex-row-reverse justify-between gap-4">
              {currentStep < finalStep && (
                <IButton
                  type="button"
                  onClick={handleNextStep}
                  className="w-[205px] p-5 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
                >
                  Далее
                </IButton>
              )}
              {currentStep === finalStep && (
                <IButton
                  type="submit"
                  className="w-[205px] p-5 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
                >
                  Зарегистрироваться
                </IButton>
              )}
              {currentStep > 1 && (
                <IButton
                  type="button"
                  onClick={handlePrevStep}
                  className="w-[205px] p-5 bg-gray-500 opacity-50 text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
                >
                  Назад
                </IButton>
              )}
            </div>

            {/*Ссылка "У вас уже есть аккаунт? Войти" */}
            <div className="flex justify-center text-sm my-4">
              <p>У вас уже есть аккаунт?&nbsp;</p>
              <IButton
                type="button"
                onClick={() => router.push('/login')}
                className="text-sm text-black hover:underline"
              >
                Войти
              </IButton>
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
};

export default RegisterSection;
