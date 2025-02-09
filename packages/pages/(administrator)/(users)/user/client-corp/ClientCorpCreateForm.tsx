import React, { JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gender, UserRole } from '@prisma/client';
import { CreateUserData } from '@shared/prisma/interface/users/interface';
import { useForm, FormProvider } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import ClientCorpCreateStep1 from '@pages/(administrator)/(users)/user/client-corp/step-create/ClientCorpCreateStep1';
import ClientCorpCreateStep2 from '@pages/(administrator)/(users)/user/client-corp/step-create/ClientCorpCreateStep2';
import { v4 as uuidv4 } from 'uuid';

interface ClientCorpCreateFormProps {
  onSubmit: (formData: CreateUserData) => Promise<string | null>;
}

interface FormData extends Omit<CreateUserData, 'gender' | 'profilePhotoPath' | 'companyProfile'> {
  confirmPassword: string;
  lastName: string;
  firstName: string;
  middleName: string;
  gender: Gender | undefined;
  profileImage?: File | null;
  companyProfile?: {
    companyName: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    companyPin: string;
    logoImage?: File | null;
  };
}

const ClientCorpCreateForm = ({ onSubmit }: ClientCorpCreateFormProps): JSX.Element => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const methods = useForm<FormData>({
    defaultValues: {
      email: 'qwertyop@gmail.com',
      password: 'String3!',
      confirmPassword: 'String3!',
      role: UserRole.ClientCorp,
      availability: true,
      lastName: 'asdas',
      firstName: 'asdsa',
      middleName: 'asd',
      phone: '111-111-111',
      gender: Gender.Male,
      address: 'asdsad',
      companyProfile: {
        companyName: 'asd',
        email: 'asdadsa@gmail.com',
        phone: '111-111-111',
        address: 'asdasd',
        website: 'https://asdasd.com',
        companyPin: 'asad',
      },
    },
  });

  const { handleSubmit, trigger } = methods;
  const router = useRouter();

  const onSubmitForm = async (data: FormData) => {
    setIsSubmitting(true);
    let profilePhotoPath: string | null = null;
    let logoImagePath: string | null = null;

    try {
      const {
        confirmPassword,
        lastName,
        firstName,
        middleName,
        gender,
        profileImage,
        companyProfile,
        ...rest
      } = data;

      const fullName = `${lastName} ${firstName} ${middleName}`;

      if (profileImage) {
        const uniqueFilename = `${uuidv4()}-${profileImage.name}`;
        profilePhotoPath = `/client-corp/${uniqueFilename}`;
      }

      if (companyProfile?.logoImage) {
        const uniqueFilename = `${uuidv4()}-${companyProfile.logoImage.name}`;
        logoImagePath = `/logos/${uniqueFilename}`;
      }

      const createUserData: CreateUserData = {
        ...rest,
        fullName,
        gender: gender ?? Gender.Male,
        profilePhotoPath: profilePhotoPath,
        companyProfile: companyProfile
          ? {
              companyName: companyProfile.companyName,
              email: companyProfile.email,
              phone: companyProfile.phone,
              address: companyProfile.address,
              website: companyProfile.website,
              companyPin: companyProfile.companyPin,
              logoImagePath: logoImagePath,
            }
          : undefined,
      };

      const userUuid = await onSubmit(createUserData);

      if (userUuid) {
        //Загрузка изображений после создания пользователя
        if (profileImage && profilePhotoPath) {
          await uploadImage(profileImage, profilePhotoPath);
        }
        if (companyProfile?.logoImage && logoImagePath) {
          await uploadImage(companyProfile.logoImage, logoImagePath);
        }

        router.push(`/user/detail/${userUuid}`);
      }
    } catch (error) {
      console.error('Ошибка при создании корпоративного клиента:', error);
      //Handle the error appropriately (e.g., show an error message to the user)
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImage = async (file: File, path: string) => {
    if (!file || !path) {
      console.error('Нет файла или пути для загрузки.');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);
    formData.append('profilePhotoPath', path);

    try {
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        console.error('Ошибка при загрузке изображения:', uploadResponse.statusText);
        return;
      }

      const uploadResult = await uploadResponse.json();
      console.log('uploadResult', uploadResult);
    } catch (error) {
      console.error('Ошибка при отправке запроса на загрузку:', error);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      router.push('/users');
    } else {
      setStep(step - 1);
    }
  };

  const handleNext = async () => {
    const valid = await trigger();
    if (valid) {
      setStep(step + 1);
    }
  };

  const steps = ['Аккаунт', 'Личная информация корпоративного клиента'];

  return (
    <div className={'w-full h-full flex flex-col gap-4'}>
      <h1 className={'text-6 leading-6 mt-4 mb-2 pl-6 font-extrabold'}>
        Создание Корпоративного Клиента
      </h1>
      <FormProvider {...methods}>
        <div className="p-5 justify-center bg-white border rounded-xl">
          <form id="client-corp-create-form" onSubmit={handleSubmit(onSubmitForm)}>
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
            {step === 1 && <ClientCorpCreateStep1 />}
            {step === 2 && <ClientCorpCreateStep2 />}
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
              form="client-corp-create-form"
              className="min-w-[205px] p-4 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
              disabled={isSubmitting}
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
