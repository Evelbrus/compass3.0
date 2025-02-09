'use client';

import React, { JSX } from 'react';
import { User } from '@prisma/client';
import Image from 'next/image';
import { LazyImage } from '@shared/components/ui/images';

interface ClientDetailViewProps {
  userData: User;
}

const renderField = (label: string, value?: string | null) => (
  <div className="grid grid-cols-2 gap-4 w-full">
    <label className="font-normal text-[14px] leading-[13.93px] text-[#989898] mb-[14px]">
      {label}:
    </label>
    <p className="font-normal text-[14px] leading-[13.93px] text-[#2A3037]">{value || 'N/A'}</p>
  </div>
);

const ClientDetailView = ({ userData }: ClientDetailViewProps): JSX.Element => {
  console.log('userData', userData);

  const userFields = [
    { label: 'Email', value: userData.email },
    { label: 'Availability', value: userData.availability ? 'Available' : 'Unavailable' },
    { label: 'Full Name', value: userData.fullName },
    { label: 'Phone', value: userData.phone },
    { label: 'Gender', value: userData.gender },
    { label: 'Address', value: userData.address },
    { label: 'Profile Photo Path', value: userData.profilePhotoPath },
  ];

  const imageSrc = userData.profilePhotoPath
    ? `/api/images/${userData.profilePhotoPath.split('/').pop()}?type=client`
    : null;

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Client Details</h2>
      <section className="nx-auto flex gap-[12px] p-6 bg-white shadow-md rounded-lg border border-gray-200">
        {imageSrc ? (
          <Image
            src={imageSrc}
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
        </div>
      </section>
    </>
  );
};

export default ClientDetailView;
