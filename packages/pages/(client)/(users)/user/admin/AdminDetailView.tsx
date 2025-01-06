'use client';

import React, { JSX } from 'react';
import { User } from '@prisma/client';

interface AdminDetailViewProps {
  userData: User;
}

const AdminDetailView = ({ userData }: AdminDetailViewProps): JSX.Element => {
  return (
    <div>
      <h2>Admin Details</h2>
      <div>
        <label>Email:</label>
        <p>{userData.email}</p>
      </div>
      <div>
        <label>Role:</label>
        <p>{userData.role}</p>
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

export default AdminDetailView;
