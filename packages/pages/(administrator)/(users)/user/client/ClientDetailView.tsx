'use client';

import React, { JSX } from 'react';
import { User } from '@prisma/client';

interface ClientDetailViewProps {
  userData: User;
}

const ClientDetailView = ({ userData }: ClientDetailViewProps): JSX.Element => {
  return (
    <div>
      <h2>Client Details</h2>
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
    </div>
  );
};

export default ClientDetailView;
