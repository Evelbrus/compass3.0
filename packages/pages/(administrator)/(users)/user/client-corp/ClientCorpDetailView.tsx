'use client';

import React, { JSX, useState } from 'react';
import { User, CompanyProfile } from '@prisma/client';
import Image from 'next/image';
import { ImageUpload } from '@shared/components/ui/inputs';
import { useForm, FormProvider } from 'react-hook-form';

// Определяем новый тип, расширяющий User и добавляющий companyProfile
interface UserWithCompanyProfile extends User {
  companyProfile?: CompanyProfile | null;
}

interface ClientCorpDetailViewProps {
  userData: UserWithCompanyProfile;
}

const renderField = (label: string, value?: string | null) => (
  <div className="grid grid-cols-2 gap-4 w-full">
    <label className="font-normal text-[14px] leading-[13.93px] text-[#989898] mb-[14px]">
      {label}:
    </label>
    <p className="font-normal text-[14px] leading-[13.93px] text-[#2A3037]">{value || 'N/A'}</p>
  </div>
);

const ClientCorpDetailView = ({ userData }: ClientCorpDetailViewProps): JSX.Element => {
  const methods = useForm({
    defaultValues: {
      profilePhotoPath: userData.profilePhotoPath || '',
    },
  });

  const [isOpen, setIsOpen] = useState(false);
  const userFields = [
    { label: 'Email', value: userData.email },
    { label: 'Availability', value: userData.availability ? 'Available' : 'Unavailable' },
    { label: 'Full Name', value: userData.fullName },
    { label: 'Phone', value: userData.phone },
    { label: 'Gender', value: userData.gender },
    { label: 'Address', value: userData.address },
    { label: 'Profile Photo Path', value: userData.profilePhotoPath },
  ];

  const companyFields = userData.companyProfile
    ? [
        { label: 'Company Name', value: userData.companyProfile.companyName },
        { label: 'Company Email', value: userData.companyProfile.email },
        { label: 'Company Phone', value: userData.companyProfile.phone },
        { label: 'Company Address', value: userData.companyProfile.address },
        { label: 'Website', value: userData.companyProfile.website },
        { label: 'Company PIN', value: userData.companyProfile.companyPin },
      ]
    : [];

  const onSubmit = (data: any) => {
    console.log('Отправляем фото:', data.profilePhotoPath);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Client Corporate Details</h2>
        <section className="mx-auto flex gap-[12px] p-6 bg-white shadow-md rounded-lg border border-gray-200">
          {userData.profilePhotoPath ? (
            <Image
              src={userData.profilePhotoPath}
              alt="Profile Photo"
              width={180}
              height={180}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="max-w-[180px]">
              <ImageUpload name="profilePhotoPath" placeholder="/placeholderImage.png" label="" />
            </div>
          )}
          <div className="mt-[20px] w-full">
            {userFields.map((field, index) => (
              <React.Fragment key={index}>{renderField(field.label, field.value)}</React.Fragment>
            ))}
            <div className="rounded-lg mb-4">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 rounded-t-lg"
              >
                <h2 className="text-2xl font-bold text-gray-700">Company Profile</h2>
                <span
                  className={`transform transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                >
                  ▼
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-700 ease-in-out ${
                  isOpen ? 'max-h-screen' : 'max-h-0'
                }`}
              >
                <div className="p-4 bg-white border-t border-gray-300">
                  {companyFields.map((field, index) => (
                    <div key={index}>{renderField(field.label, field.value)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full">
            <ImageUpload name="profilePhotoPath" label={''} placeholder="/placeholderImage.png" />
          </div>
        </section>
      </form>
    </FormProvider>
  );
};

export default ClientCorpDetailView;
