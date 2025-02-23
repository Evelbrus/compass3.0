'use client';

import React, { JSX } from 'react';
import Image from 'next/image';
import { CompanyProfile } from '@prisma/client';
import { LazyImage } from '@shared/components/ui/images';
import { DetailItem } from '@pages/(administrator)/vehicles/VehiclesDetail';
import { SafeUser } from '@pages/(administrator)/(users)/user/ClientsDetailAdminPage';

//Определяем новый тип, расширяющий User и добавляющий companyProfile
interface UserWithCompanyProfile extends SafeUser {
  companyProfile?: CompanyProfile | null;
}

interface ClientCorpDetailViewProps {
  userData: UserWithCompanyProfile;
}

const renderField = (label: string, value?: string | null) => (
  <div className="grid grid-cols-2 gap-2 w-full">
    <label className="font-normal text-[14px] leading-[13.93px] text-[#989898]">{label}:</label>
    <p className="font-normal text-[14px] leading-[13.93px] text-[#2A3037]">{value || 'N/A'}</p>
  </div>
);

const ClientCorpDetailView = ({ userData }: ClientCorpDetailViewProps): JSX.Element => {
  const userFields = [
    { label: 'Email', value: userData.email },
    { label: 'Availability', value: userData.availability ? 'Available' : 'Unavailable' },
    { label: 'Full Name', value: userData.fullName },
    { label: 'Phone', value: userData.phone },
    { label: 'Gender', value: userData.gender },
    { label: 'Address', value: userData.address },
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

  const userImageSrc = userData.profilePhotoPath
    ? `/api/images/${userData.profilePhotoPath.split('/').pop()}?type=avatar`
    : null;

  //Формируем URL для логотипа компании
  const companyLogoSrc = userData.companyProfile?.logoImagePath
    ? `/api/images/${userData.companyProfile.logoImagePath.split('/').pop()}?type=logo`
    : null;

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Client Corporate Details</h2>
      <section className="mx-auto flex gap-[12px] p-6 bg-white shadow-md rounded-lg border border-gray-200">
        <div className="nx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <div className="w-full flex gap-[12px]">
            {userImageSrc ? (
              <Image
                src={userImageSrc}
                alt="Profile Photo"
                width={180}
                height={180}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="max-w-[280px] h-[200px] flex items-center justify-center bg-gray-50 p-[30px] rounded-[8px]">
                <LazyImage src="/new-user.svg" alt="logotype" className="w-[330px] h-[140px]" />
              </div>
            )}
            <div className="grid gap-1 mt-5">
              {userFields.map((field, index) => (
                <React.Fragment key={index}>{renderField(field.label, field.value)}</React.Fragment>
              ))}
            </div>
          </div>
          {/*Отображение логотипа компании*/}
          <div className="w-full h-[240px] bg-gray-50 p-[30px] flex items-center justify-center">
            {companyLogoSrc ? (
              <Image
                src={companyLogoSrc}
                alt="Company Logo"
                width={180}
                height={180}
                className="object-contain"
              />
            ) : (
              <h1>Logo</h1>
            )}
          </div>
        </div>
      </section>
      <div className="rounded-lg mt-6">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Company Profile</h2>
        <div className="p-4 bg-white grid grid-cols-1 lg:grid-cols-2 gap-2">
          {companyFields.map((field, index) => (
            <DetailItem key={index} label={field.label} value={field.value} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ClientCorpDetailView;
