//DriverEditForm.tsx
'use client';

import React, { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EditUserData } from '@shared/prisma/interface/users/interface';
import { useForm, FormProvider } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import DriverEditStep1 from '@pages/(administrator)/(users)/user/driver/step-edit/DriverEditStep1';
import DriverEditStep2 from '@pages/(administrator)/(users)/user/driver/step-edit/DriverEditStep2';
import DriverEditStep3 from '@pages/(administrator)/(users)/user/driver/step-edit/DriverEditStep3';
import DriverEditStep4 from '@pages/(administrator)/(users)/user/driver/step-edit/DriverEditStep4';
import DriverEditStep5 from '@pages/(administrator)/(users)/user/driver/step-edit/DriverEditStep5';
import { v4 as uuidv4 } from 'uuid';
import { Gender } from '@prisma/client';

interface DriverEditFormProps {
  userData: EditUserData;
  onSubmit: (formData: EditUserData) => Promise<string | null>;
}

interface FormData extends EditUserData {
  lastName: string;
  firstName: string;
  middleName: string;
  profileImage?: File | null;
  driverProfile: EditUserData['driverProfile'] & {
    passportImage?: File | null;
    licenseImage?: File | null;
    profileImage?: File | null;
  };
}

const DriverEditForm = ({ userData, onSubmit }: DriverEditFormProps): JSX.Element => {
  const router = useRouter();

  //Функция формирования URL (оставляем, как есть, для использования в ImageUpload)
  const getImageUrl = (path: string | null | undefined, type: string): string | null => {
    if (!path) return null;
    const baseImageUrl = `/api/images/${path.split('/').pop()}`;
    const fullImageUrl = `${baseImageUrl}?type=${type}`;
    return encodeURIComponent(fullImageUrl); //Кодируем URL
  };

  const methods = useForm<FormData>({
    defaultValues: {
      email: userData.email,
      lastName: userData.fullName.split(' ')[0],
      firstName: userData.fullName.split(' ')[1],
      middleName: userData.fullName.split(' ')[2] || '',
      phone: userData.phone,
      gender: userData.gender,
      address: userData.address,
      profileImage: null, //ВСЕГДА null
      driverProfile: userData.driverProfile
        ? {
            ...userData.driverProfile,
            passportImage: null, //ВСЕГДА null
            licenseImage: null, //ВСЕГДА null
            profileImage: null,
          }
        : {
            passportImage: null,
            licenseImage: null,
            profileImage: null,
          },
    },
    //Убираем приведение к 'any'!
  });

  const [step, setStep] = useState(1);
  const {
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = methods;

  useEffect(() => {
    const [ln, fn, mn] = userData.fullName.split(' ');
    const resetData: FormData = {
      //Тип FormData
      ...userData,
      lastName: ln || '',
      firstName: fn || '',
      middleName: mn || '',
      profileImage: null, //ВСЕГДА null
      driverProfile: userData.driverProfile
        ? {
            ...userData.driverProfile,
            passportImage: null, //ВСЕГДА null
            licenseImage: null, //ВСЕГДА null
            profileImage: null,
          }
        : {
            passportImage: null,
            licenseImage: null,
            profileImage: null,
          },
    };

    reset(resetData); //Убираем приведение к 'any'
  }, [userData, reset]);

  const uploadImages = async (images: { file: File; path: string }[]) => {
    if (!images.length) return;

    const formData = new FormData();
    images.forEach(({ file, path }) => {
      if (path.includes('passport')) {
        formData.append('passportImage', file);
        formData.append('passportPhotoPath', path);
      } else if (path.includes('license')) {
        formData.append('licenseImage', file);
        formData.append('licensePhotoPath', path);
      } else if (path.includes('drivers/profile')) {
        formData.append('additionalProfileImage', file);
        formData.append('additionalProfilePhotoPath', path);
      } else {
        formData.append('profileImage', file);
        formData.append('profilePhotoPath', path);
      }
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Ошибка при загрузке изображений:', response.statusText, errorData);
      } else {
        const result = await response.json();
        console.log('Результат загрузки изображений:', result);
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса на загрузку изображений:', error);
    }
  };

  const onSubmitForm = async (data: FormData) => {
    console.log('onSubmitForm data:', data); //ЛОГ!

    const { lastName, firstName, middleName, profileImage, driverProfile, ...rest } = data;
    const fullName = `${lastName} ${firstName} ${middleName}`;

    let profilePhotoPath: string | null = null;
    let newProfileImage = false;
    if (profileImage) {
      profilePhotoPath = `/drivers/${uuidv4()}-${profileImage.name}`;
      newProfileImage = true;
    }

    let passportPhotoPath: string | null = null;
    let newPassportImage = false;
    if (driverProfile?.passportImage) {
      passportPhotoPath = `/drivers/passport/${uuidv4()}-${driverProfile.passportImage.name}`;
      newPassportImage = true;
    }

    let licensePhotoPath: string | null = null;
    let newLicenseImage = false;
    if (driverProfile?.licenseImage) {
      licensePhotoPath = `/drivers/license/${uuidv4()}-${driverProfile.licenseImage.name}`;
      newLicenseImage = true;
    }

    let additionalProfilePhotoPath: string | null = null;
    let newAdditionalProfileImage = false;
    if (driverProfile?.profileImage) {
      additionalProfilePhotoPath = `/drivers/profile/${uuidv4()}-${driverProfile.profileImage.name}`;
      newAdditionalProfileImage = true;
    }

    const {
      passportImage,
      licenseImage,
      profileImage: dpImage,
      ...restDriverProfile
    } = driverProfile || {};

    const updatedUserData: EditUserData = {
      ...rest,
      fullName,
      profilePhotoPath: profilePhotoPath || userData.profilePhotoPath || '',
      driverProfile: driverProfile
        ? {
            ...restDriverProfile,
            passportPhotoPath: passportPhotoPath || userData.driverProfile?.passportPhotoPath || '',
            licensePhotoPath: licensePhotoPath || userData.driverProfile?.licensePhotoPath || '',
            profilePhotoPath:
              additionalProfilePhotoPath || userData.driverProfile?.profilePhotoPath || '',
          }
        : null,
    }; //Убираем 'as any'

    try {
      const userUuid = await onSubmit(updatedUserData);
      console.log('userUuid:', userUuid); //ЛОГ!

      if (userUuid) {
        const imagesToUpload: { file: File; path: string }[] = [];
        if (newProfileImage && profileImage && profilePhotoPath) {
          imagesToUpload.push({ file: profileImage, path: profilePhotoPath });
        }
        if (newPassportImage && driverProfile?.passportImage && passportPhotoPath) {
          imagesToUpload.push({ file: driverProfile.passportImage, path: passportPhotoPath });
        }
        if (newLicenseImage && driverProfile?.licenseImage && licensePhotoPath) {
          imagesToUpload.push({ file: driverProfile.licenseImage, path: licensePhotoPath });
        }
        if (
          newAdditionalProfileImage &&
          driverProfile?.profileImage &&
          additionalProfilePhotoPath
        ) {
          imagesToUpload.push({
            file: driverProfile.profileImage,
            path: additionalProfilePhotoPath,
          });
        }

        console.log('imagesToUpload:', imagesToUpload); //ЛОГ!
        if (imagesToUpload.length > 0) {
          await uploadImages(imagesToUpload);
        }

        router.push('/users');
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных водителя:', error);
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

  const stepsArray = [
    'Аккаунт',
    'Личная информация водителя',
    'Опыт работы',
    'Транспортные данные',
    'Банковские реквизиты',
  ];

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <h1 className="text-6 leading-6 mt-4 mb-2 pl-6 font-extrabold">Редактирование Водителя</h1>
      <FormProvider {...methods}>
        <div className="p-5 justify-center bg-white border rounded-xl">
          <form id="driver-edit-form" onSubmit={handleSubmit(onSubmitForm)}>
            <div className="flex justify-start gap-2 mb-4">
              {stepsArray.map((label, index) => (
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
            {step === 1 && <DriverEditStep1 />}
            {step === 2 && <DriverEditStep2 />}
            {step === 3 && <DriverEditStep3 />}
            {step === 4 && <DriverEditStep4 />}
            {step === 5 && <DriverEditStep5 />}
          </form>
        </div>

        <div className="w-full flex justify-end gap-4">
          <IButton
            type="button"
            className="w-[205px] p-3 bg-gray-500 opacity-50 text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
            textClassName="w-full text-center justify-center"
            onClick={handleBack}
          >
            Назад
          </IButton>
          {step < 5 && (
            <IButton
              type="button"
              className="w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
              onClick={handleNext}
            >
              Далее
            </IButton>
          )}
          {step === 5 && (
            <IButton
              type="submit"
              form="driver-edit-form"
              className="min-w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
            >
              Обновить водителя
            </IButton>
          )}
        </div>
      </FormProvider>
    </div>
  );
};

export default DriverEditForm;
