'use client';

import React, { JSX } from 'react';
import { SafeUser } from '@pages/(administrator)/(users)/user/ClientsDetailAdminPage';
import Image from 'next/image';
import { LazyImage } from '@shared/components/ui/images';

interface ClientDetailViewProps {
  userData: SafeUser;
}

const renderField = (label: string, value?: string | null) => (
  <div className="grid grid-cols-2 gap-2 w-full">
    <label className="font-normal text-[14px] text-[#989898]">{label}:</label>
    <p className="font-normal text-[14px] text-[#2A3037]">{value || 'N/A'}</p>
  </div>
);

const ClientDetailView = ({ userData }: ClientDetailViewProps): JSX.Element => {
  const userFields = [
    { label: 'Email', value: userData.email },
    { label: 'ФИО', value: userData.fullName },
    { label: 'Телефон', value: userData.phone },
    { label: 'Пол', value: userData.gender },
    { label: 'Адрес', value: userData.address },
    { label: 'Доступность', value: userData.availability ? 'Available' : 'Unavailable' },
  ];

  const imageSrc = userData.profilePhotoPath
    ? `/api/images/${userData.profilePhotoPath.split('/').pop()}?type=avatar`
    : null;

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Client Details</h2>
      <section className="flex flex-col sm:flex-row lg:flex-row md:flex-row gap-6 p-6 bg-white shadow-md rounded-lg border border-gray-200 w-full">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt="Client Profile Photo"
            width={180}
            height={180}
            className="rounded-lg object-cover"
          />
        ) : (
          <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-50 rounded-lg">
            <LazyImage src="/new-user.svg" alt="Default Profile" className="w-[140px] h-[140px]" />
          </div>
        )}
        <div className="grid gap-2">
          {userFields.map((field, index) => (
            <React.Fragment key={index}>{renderField(field.label, field.value)}</React.Fragment>
          ))}
        </div>
      </section>
    </>
  );
};

export default ClientDetailView;
