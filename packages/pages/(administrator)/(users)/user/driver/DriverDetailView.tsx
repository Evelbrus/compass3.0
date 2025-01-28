'use client';

import React, { JSX, useState } from 'react';
import { DriverProfile, User } from '@prisma/client';
import Image from 'next/image';
import { LazyImage } from '@shared/components/ui/images';

interface UserWithDriverProfile extends User {
  driverProfile?: DriverProfile | null;
}

interface DriverDetailViewProps {
  userData: UserWithDriverProfile;
}

const renderField = (label: string, value?: string | number | null) => (
  <div className="grid grid-cols-2 gap-4">
    <label className="font-normal text-[14px] leading-[13.93px] text-[#989898] mb-[14px]">
      {label}:
    </label>
    <p className="font-normal text-[14px] leading-[13.93px] text-[#2A3037]">
      {value !== null && value !== undefined ? String(value) : 'N/A'}
    </p>
  </div>
);

const DriverDetailView = ({ userData }: DriverDetailViewProps): JSX.Element => {
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);

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

  return (
    <>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Driver Details</h2>
      <section className="nx-auto flex p-6 bg-white shadow-md rounded-lg border border-gray-200">
        <div className="mt-[20px] w-full flex gap-[12px]">
          {userData.profilePhotoPath ? (
            <Image
              src={userData.profilePhotoPath}
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
          <div className="flex flex-col">
            {userFields.map((field, index) => (
              <React.Fragment key={index}>{renderField(field.label, field.value)}</React.Fragment>
            ))}

            <div className="rounded-lg mb-4">
              <button
                type="button"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="w-full flex justify-between items-center rounded-t-lg"
              >
                <p className="text-[14px] leading-[13.93px] font-[700]">Status:</p>
                <span
                  className={`transform transition-transform ${isStatusOpen ? 'rotate-180' : 'rotate-0'}`}
                >
                  ▼
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-700 ease-in-out ${
                  isStatusOpen ? 'max-h-screen' : 'max-h-0'
                }`}
              >
                <div className="p-4 bg-white border-t border-gray-300">
                  <div className="grid grid-cols-2 gap-4">
                    <button className="text-blue-600">Change</button>
                    <button className="text-blue-600">Rate</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg mb-4">
              <button
                type="button"
                onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                className="w-full flex justify-between items-center rounded-t-lg"
              >
                <h2 className=" font-bold text-gray-700">Company Profile</h2>
                <span
                  className={`transform transition-transform ${isCompanyOpen ? 'rotate-180' : 'rotate-0'}`}
                >
                  ▼
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-700 ease-in-out ${
                  isCompanyOpen ? 'max-h-screen' : 'max-h-0'
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
        </div>

        <div className="grid grid-cols-2 gap-1 w-full">
          <div className="w-full h-[145px] bg-gray-50 p-[30px] flex items-center justify-center">
            {userData.driverProfile?.passportPhotoPath ? (
              <Image
                src={userData.driverProfile.passportPhotoPath}
                alt="Passport Photo"
                width={180}
                height={145}
                className="rounded-lg object-cover"
              />
            ) : (
              <p>No Passport Photo </p>
            )}
          </div>

          <div className="w-full h-[145px] bg-gray-50 p-[30px] flex items-center justify-center">
            {userData.driverProfile?.licensePhotoPath ? (
              <Image
                src={userData.driverProfile.licensePhotoPath}
                alt="License Photo"
                width={180}
                height={145}
                className="rounded-lg object-cover"
              />
            ) : (
              <p>No License Photo</p>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default DriverDetailView;
