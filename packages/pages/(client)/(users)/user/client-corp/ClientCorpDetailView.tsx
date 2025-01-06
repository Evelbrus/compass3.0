'use client';

import React, { JSX } from 'react';
import { User, CompanyProfile } from '@prisma/client';

//Определяем новый тип, расширяющий User и добавляющий companyProfile
interface UserWithCompanyProfile extends User {
  companyProfile?: CompanyProfile | null;
}

interface ClientCorpDetailViewProps {
  userData: UserWithCompanyProfile;
}

const ClientCorpDetailView = ({ userData }: ClientCorpDetailViewProps): JSX.Element => {
  return (
    <div>
      <h2>Client Corporate Details</h2>
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
      {userData.companyProfile && (
        <div>
          <h2>Company Profile</h2>
          <div>
            <label>Company Name:</label>
            <p>{userData.companyProfile.companyName}</p>
          </div>
          <div>
            <label>Company Email:</label>
            <p>{userData.companyProfile.email}</p>
          </div>
          <div>
            <label>Company Phone:</label>
            <p>{userData.companyProfile.phone}</p>
          </div>
          <div>
            <label>Company Address:</label>
            <p>{userData.companyProfile.address}</p>
          </div>
          <div>
            <label>Website:</label>
            <p>{userData.companyProfile.website}</p>
          </div>
          <div>
            <label>Company PIN:</label>
            <p>{userData.companyProfile.companyPin}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientCorpDetailView;
