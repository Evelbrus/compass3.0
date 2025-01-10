'use client';

import React, { JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChangingDriver,
  Citizenship,
  DriverExperience,
  DriverProfile,
  Gender,
  IdentityDocument,
  Status,
  UserRole,
} from '@prisma/client';
import { CreateUserData } from '@shared/prisma/interface/users/interface';
import { useForm, FormProvider } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import DriverCreateStep1 from '@pages/(administrator)/(users)/user/driver/step-create/DriverCreateStep1';
import DriverCreateStep2 from '@pages/(administrator)/(users)/user/driver/step-create/DriverCreateStep2';
import DriverCreateStep3 from '@pages/(administrator)/(users)/user/driver/step-create/DriverCreateStep3';
import DriverCreateStep4 from '@pages/(administrator)/(users)/user/driver/step-create/DriverCreateStep4';
import DriverCreateStep5 from '@pages/(administrator)/(users)/user/driver/step-create/DriverCreateStep5';

interface DriverCreateFormProps {
  onSubmit: (formData: CreateUserData) => void;
}

interface Profile
  extends Omit<
    DriverProfile,
    'status' | 'citizenship' | 'identityDocument' | 'changingDriver' | 'gender'
  > {
  status: Status | undefined;
  citizenship: Citizenship | undefined;
  identityDocument: IdentityDocument | undefined;
  changingDriver: ChangingDriver | undefined;
  driverExperience: DriverExperience[] | undefined;
}

interface FormData extends Omit<CreateUserData, 'gender' | 'driverProfile'> {
  confirmPassword: string;
  lastName: string;
  firstName: string;
  middleName: string;
  gender: Gender | undefined;
  driverProfile: Profile;
}

const DriverCreateForm = ({ onSubmit }: DriverCreateFormProps): JSX.Element => {
  const [step, setStep] = useState(1);
  const methods = useForm<FormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.Driver,
      availability: true,
      lastName: '',
      firstName: '',
      middleName: '',
      phone: '',
      gender: undefined,
      address: '',
      profilePhotoPath: '',
      driverProfile: {
        status: undefined,
        citizenship: undefined,
        identityDocument: undefined,
        passportId: '',
        passportIssueDate: null,
        passportIssued: '',
        birthDate: null,
        birthPlace: '',
        actualAddress: '',
        permanentAddress: '',
        changingDriver: undefined,
        typeDriver: '',
        yearsOfDriving: 0,
        passportPhotoPath: null,
        profilePhotoPath: null,
        licensePhotoPath: '',
        bankName: '',
        bankBic: '',
        bankAccountNumber: '',
        cardNumber: '',
        driverExperience: [
          {
            companyName: '',
            position: '',
            from: undefined,
            to: undefined,
          },
        ],
      },
    },
  });

  const { handleSubmit, trigger } = methods;
  const router = useRouter();

  const steps = [
    'Аккаунт',
    'Личная информация водителя',
    'Опыт работы',
    'Транспортные данные',
    'Банковские реквизиты',
  ];

  const onSubmitForm = (data: FormData) => {
    const { confirmPassword, lastName, firstName, middleName, gender, driverProfile, ...rest } =
      data;
    const fullName = `${lastName} ${firstName} ${middleName}`;
    const createUserData: CreateUserData = {
      ...rest,
      fullName,
      gender: gender ?? Gender.None,
      driverProfile: {
        ...driverProfile,
        status: driverProfile.status ?? Status.None,
        citizenship: driverProfile.citizenship ?? Citizenship.None,
        identityDocument: driverProfile.identityDocument ?? IdentityDocument.None,
        changingDriver: driverProfile.changingDriver ?? ChangingDriver.None,
      },
    };
    onSubmit(createUserData);
  };

  const handleBack = () => {
    if (step === 1) {
      router.push('/drivers');
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

  return (
    <div className={'w-full h-full flex flex-col gap-4'}>
      <h1 className={'text-6 leading-6 mt-4 mb-2 pl-6 font-extrabold'}>Создание Водителя</h1>
      <FormProvider {...methods}>
        <div className="p-5 justify-center bg-white border rounded-xl">
          <form id="driver-create-form" onSubmit={handleSubmit(onSubmitForm)}>
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
            {step === 1 && <DriverCreateStep1 />}
            {step === 2 && <DriverCreateStep2 />}
            {step === 4 && <DriverCreateStep3 />}
            {step === 3 && <DriverCreateStep4 />}
            {step === 5 && <DriverCreateStep5 />}
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
              form="driver-create-form"
              className="w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
              textClassName="w-full text-center justify-center"
            >
              Создать водителя
            </IButton>
          )}
        </div>
      </FormProvider>
    </div>
  );
};

export default DriverCreateForm;
