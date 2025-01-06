'use client';

import React, { JSX } from 'react';
import { DriverProfile, User } from '@prisma/client';

interface UserWithDriverProfile extends User {
  driverProfile?: DriverProfile | null;
}

interface DriverDetailViewProps {
  userData: UserWithDriverProfile;
}

const DriverDetailView = ({ userData }: DriverDetailViewProps): JSX.Element => {
  return (
    <div>
      <h2>Driver Details</h2>
      <div>
        <label>Email:</label>
        <p>{userData.email}</p>
      </div>
      <div>
        <label>Availability:</label>
        <p>{userData.availability ? 'Available' : 'Unavailable'}</p>
      </div>
      <div>
        <label>Full Name:</label>
        <p>{userData.fullName}</p>
      </div>
      <div>
        <label>Phone:</label>
        <p>{userData.phone}</p>
      </div>
      <div>
        <label>Gender:</label>
        <p>{userData.gender}</p>
      </div>
      <div>
        <label>Address:</label>
        <p>{userData.address}</p>
      </div>
      <div>
        <label>Profile Photo Path:</label>
        <p>{userData.profilePhotoPath}</p>
      </div>
      {userData.driverProfile && (
        <div>
          <h2>Driver Profile</h2>
          <div>
            <label>Status:</label>
            <p>{userData.driverProfile.status}</p>
          </div>
          <div>
            <label>Citizenship:</label>
            <p>{userData.driverProfile.citizenship}</p>
          </div>
          <div>
            <label>Identity Document:</label>
            <p>{userData.driverProfile.identityDocument}</p>
          </div>
          <div>
            <label>Passport ID:</label>
            <p>{userData.driverProfile.passportId}</p>
          </div>
          <div>
            <label>Passport Issue Date:</label>
            <p>
              {userData.driverProfile.passportIssueDate
                ? new Date(userData.driverProfile.passportIssueDate).toLocaleDateString()
                : ''}
            </p>
          </div>
          <div>
            <label>Passport Issued By:</label>
            <p>{userData.driverProfile.passportIssued}</p>
          </div>
          <div>
            <label>Birth Date:</label>
            <p>
              {userData.driverProfile.birthDate
                ? new Date(userData.driverProfile.birthDate).toLocaleDateString()
                : ''}
            </p>
          </div>
          <div>
            <label>Birth Place:</label>
            <p>{userData.driverProfile.birthPlace}</p>
          </div>
          <div>
            <label>Actual Address:</label>
            <p>{userData.driverProfile.actualAddress}</p>
          </div>
          <div>
            <label>Permanent Address:</label>
            <p>{userData.driverProfile.permanentAddress}</p>
          </div>
          <div>
            <label>Changing Driver:</label>
            <p>{userData.driverProfile.changingDriver}</p>
          </div>
          <div>
            <label>Type of Driver:</label>
            <p>{userData.driverProfile.typeDriver}</p>
          </div>
          <div>
            <label>Rate Type:</label>
            <p>{userData.driverProfile.rateDriver}</p>
          </div>
          <div>
            <label>Years of Driving:</label>
            <p>{userData.driverProfile.yearsOfDriving}</p>
          </div>
          <div>
            <label>Passport Photo Path:</label>
            <p>{userData.driverProfile.passportPhotoPath}</p>
          </div>
          <div>
            <label>License Photo Path:</label>
            <p>{userData.driverProfile.licensePhotoPath}</p>
          </div>
          <div>
            <label>Bank Name:</label>
            <p>{userData.driverProfile.bankName}</p>
          </div>
          <div>
            <label>Bank BIC:</label>
            <p>{userData.driverProfile.bankBic}</p>
          </div>
          <div>
            <label>Bank Account Number:</label>
            <p>{userData.driverProfile.bankAccountNumber}</p>
          </div>
          <div>
            <label>Card Number:</label>
            <p>{userData.driverProfile.cardNumber}</p>
          </div>
          <div>
            <label>Profile Photo Path:</label>
            <p>{userData.driverProfile.profilePhotoPath}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDetailView;
