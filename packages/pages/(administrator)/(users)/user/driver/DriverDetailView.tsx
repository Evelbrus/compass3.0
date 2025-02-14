'use client';

import React, { JSX } from 'react';
import { DriverProfile, User } from '@prisma/client';
import { LazyImage } from '@shared/components/ui/images';
import { DetailItem } from '@pages/(administrator)/vehicles/VehiclesDetail';
import { SelectSingle } from '@shared/components/ui/inputs';
import {
  changingDriverOptions,
  statusOptions,
} from '@shared/lib/effector/drivers/optionsTranslation/optionsTranslationDriver';
import { useRouter } from 'next/navigation';

interface UserWithDriverProfile extends User {
  driverProfile?: DriverProfile | null;
}

interface DriverDetailViewProps {
  userData: UserWithDriverProfile;
}

const renderField = (label: string, value?: string | number | null) => (
  <div className="grid grid-cols-2 gap-[59px]">
    <label className="font-normal text-[14px] leading-[13.93px] text-[#989898] mb-[14px]">
      {label}:
    </label>
    <p className="font-normal text-[14px] leading-[13.93px] text-[#2A3037]">
      {value !== null && value !== undefined ? String(value) : 'N/A'}
    </p>
  </div>
);

const DriverDetailView = ({ userData }: DriverDetailViewProps): JSX.Element => {
  const router = useRouter();

  console.log('userData.uuid', userData.uuid);

  const userFields = [
    { label: 'Email', value: userData.email },
    { label: 'Availability', value: userData.availability ? 'Available' : 'Unavailable' },
    { label: 'Full Name', value: userData.fullName },
    { label: 'Phone', value: userData.phone },
    { label: 'Gender', value: userData.gender },
    { label: 'Address', value: userData.address },
    { label: 'Profile Photo Path', value: userData.profilePhotoPath },
  ];

  const companyFields = userData.driverProfile
    ? [
        { label: 'Status', value: userData.driverProfile.status },
        { label: 'Citizenship', value: userData.driverProfile.citizenship },
        { label: 'Identity Document', value: userData.driverProfile.identityDocument },
        { label: 'Passport ID', value: userData.driverProfile.passportId },
        {
          label: 'Passport Issue Date',
          value: userData.driverProfile.passportIssueDate
            ? new Date(userData.driverProfile.passportIssueDate).toLocaleDateString()
            : '',
        },
        { label: 'Passport Issued By', value: userData.driverProfile.passportIssued },
        {
          label: 'Birth Date',
          value: userData.driverProfile.birthDate
            ? new Date(userData.driverProfile.birthDate).toLocaleDateString()
            : '',
        },
        { label: 'Birth Place', value: userData.driverProfile.birthPlace },
        { label: 'Actual Address', value: userData.driverProfile.actualAddress },
        { label: 'Permanent Address', value: userData.driverProfile.permanentAddress },
        { label: 'Changing Driver', value: userData.driverProfile.changingDriver },
        { label: 'Type of Driver', value: userData.driverProfile.typeDriver },
        { label: 'Years of Driving', value: userData.driverProfile.yearsOfDriving },
        { label: 'Passport Photo Path', value: userData.driverProfile.passportPhotoPath },
        { label: 'License Photo Path', value: userData.driverProfile.licensePhotoPath },
        { label: 'Bank Name', value: userData.driverProfile.bankName },
        { label: 'Bank BIC', value: userData.driverProfile.bankBic },
        { label: 'Bank Account Number', value: userData.driverProfile.bankAccountNumber },
        { label: 'Card Number', value: userData.driverProfile.cardNumber },
        { label: 'Profile Photo Path', value: userData.driverProfile.profilePhotoPath },
      ]
    : [];

  //URL для фото пользователя (основное фото)
  const profilePhotoUrl = userData.profilePhotoPath
    ? `/api/images/${userData.profilePhotoPath.split('/').pop()}?type=drivers`
    : null;

  console.log('profilePhotoUrl', profilePhotoUrl);

  //URL для фото паспорта
  const passportPhotoUrl = userData.driverProfile?.passportPhotoPath
    ? `/api/images/${userData.driverProfile.passportPhotoPath.split('/').pop()}?type=drivers/passport`
    : null;

  //URL для фото лицензии
  const licensePhotoUrl = userData.driverProfile?.licensePhotoPath
    ? `/api/images/${userData.driverProfile.licensePhotoPath.split('/').pop()}?type=drivers/license`
    : null;

  //URL для дополнительного фото из профиля водителя
  const driverProfilePhotoUrl = userData.driverProfile?.profilePhotoPath
    ? `/api/images/${userData.driverProfile.profilePhotoPath.split('/').pop()}?type=drivers/profile`
    : null;

  const handleEdit = () => {
    router.push(`/user/edit/${userData.uuid}`);
  };

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Driver Details</h2>
      <section className="flex bg-white shadow-md rounded-lg border border-gray-200 p-6">
        <div className="nx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          {/*Левая колонка: основное фото и информация пользователя */}
          <div className="flex flex-col">
            <div className="mt-[20px] w-full flex gap-[12px]">
              {profilePhotoUrl ? (
                <LazyImage
                  src={profilePhotoUrl}
                  alt="Profile Photo"
                  className="w-[180px] h-[180px] rounded-full object-cover"
                />
              ) : (
                <div className="max-w-[280px] h-[200px] flex items-center justify-center bg-gray-50 p-[30px] rounded-[8px]">
                  <LazyImage src="/new-user.svg" alt="logotype" className="w-[330px] h-[140px]" />
                </div>
              )}
              <div className="flex flex-col">
                {userFields.map((field, index) => (
                  <React.Fragment key={index}>
                    {renderField(field.label, field.value)}
                  </React.Fragment>
                ))}
                <div className="w-full flex justify-between items-center rounded-t-lg gap-4">
                  <p className="text-[14px] leading-[13.93px] font-[700]">Status:</p>
                  <SelectSingle
                    options={statusOptions}
                    classNameBg="bg-black"
                    classNamePlaceholder="text-white"
                    classNameBorderRadius="rounded-lg"
                    value={
                      userData.driverProfile?.status
                        ? {
                            label: userData.driverProfile.status,
                            value: userData.driverProfile.status,
                          }
                        : null
                    }
                    onChange={(select) => console.log('Выбран статус:', select?.value)}
                    className="w-full"
                  />
                </div>
                <div className="w-full flex justify-between items-center mt-4">
                  <SelectSingle
                    label="Смена"
                    options={changingDriverOptions}
                    value={
                      userData.driverProfile?.changingDriver
                        ? {
                            label: userData.driverProfile.changingDriver,
                            value: userData.driverProfile.changingDriver,
                          }
                        : null
                    }
                    onChange={(selected) => console.log('Выбрана смена:', selected?.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/*Правая колонка: фото паспорта и лицензии */}
          <div className="grid grid-cols-2 gap-1 w-full">
            <div className="w-full h-[145px] bg-gray-50 p-[30px] flex items-center justify-center">
              {passportPhotoUrl ? (
                <LazyImage
                  src={passportPhotoUrl}
                  alt="Passport Photo"
                  className="w-[180px] h-[180px] rounded-lg object-cover"
                />
              ) : (
                <div className="flex items-center gap-[18px]">
                  <LazyImage src="/doc_icon3.png" alt="doc icon" className="w-[76px] h-[76px]" />
                  <LazyImage src="/doc_icon2.png" alt="doc icon" className="w-[160px] h-[56px]" />
                </div>
              )}
            </div>

            <div className="w-full h-[145px] bg-gray-50 p-[30px] flex items-center justify-center">
              {licensePhotoUrl ? (
                <LazyImage
                  src={licensePhotoUrl}
                  alt="License Photo"
                  className="w-[180px] h-[180px] rounded-lg object-cover"
                />
              ) : (
                <div className="flex items-center gap-[18px]">
                  <LazyImage src="/doc_icon1.png" alt="doc icon" className="w-[50px] h-[40px]" />
                  <LazyImage src="/doc_icon2.png" alt="doc icon" className="w-[170px] h-[66px]" />
                </div>
              )}
            </div>
          </div>
        </div>
        <div onClick={handleEdit} className="cursor-pointer ml-[9px]">
          <LazyImage src="/edit.png" alt="driver-profile-edit_icon" className="w-[24px] h-[24px]" />
        </div>
      </section>

      {/*Дополнительное фото из профиля водителя */}
      {driverProfilePhotoUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Additional Profile Photo</h3>
          <div className="w-full h-[145px] bg-gray-50 p-[30px] flex items-center justify-center">
            <LazyImage
              src={driverProfilePhotoUrl}
              alt="Driver Profile Additional Photo"
              className="w-[180px] h-[180px] rounded-lg object-cover"
            />
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 my-6">Driver Profile</h2>
      <div className="rounded-lg p-6 bg-white shadow-md border border-gray-200 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {companyFields.map((field, index) => (
          <DetailItem key={index} label={field.label} value={field.value} />
        ))}
      </div>
    </>
  );
};

export default DriverDetailView;
