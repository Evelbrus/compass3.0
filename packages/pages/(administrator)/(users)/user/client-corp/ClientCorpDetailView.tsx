'use client';

import React, { JSX, useState } from 'react';
import { SafeUser } from '@pages/(administrator)/(users)/user/ClientsDetailAdminPage'; //Import SafeUser
import { CompanyProfile } from '@prisma/client';
import Image from 'next/image';
import { LazyImage } from '@shared/components/ui/images';

//Определяем новый тип, расширяющий SafeUser и добавляющий companyProfile
interface SafeUserWithCompanyProfile extends SafeUser {
  companyProfile?: CompanyProfile | null;
}

interface ClientCorpDetailViewProps {
  userData: SafeUserWithCompanyProfile;
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
  const [isOpen, setIsOpen] = useState(false);

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
    ? `/api/images/${userData.profilePhotoPath.split('/').pop()}?type=client-corp`
    : null;

  //Формируем URL для логотипа компании
  const companyLogoSrc = userData.companyProfile?.logoImagePath
    ? `/api/images/${userData.companyProfile.logoImagePath.split('/').pop()}?type=logos`
    : null;

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Client Corporate Details</h2>
      <section className="mx-auto flex gap-[12px] p-6 bg-white shadow-md rounded-lg border border-gray-200">
        {userImageSrc ? (
          <Image
            src={userImageSrc}
            alt="Profile Photo"
            width={180}
            height={180}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="max-w-[280px] h-[200px] flex items-center justify-center bg-gray-50 p-[30px] rounded-[8px]">
            <LazyImage src="/new-user.svg" alt="logotype" className="w-[330px] h-[140px]" />
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
      </section>
    </>
  );
};

export default ClientCorpDetailView;
