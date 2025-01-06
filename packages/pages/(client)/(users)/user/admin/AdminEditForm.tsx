'use client';

import React, { JSX, useState } from 'react';
import { Gender, UserRole } from '@prisma/client';
import { EditUserData } from '@shared/prisma/interface/users/interface';

interface AdminEditFormProps {
  userData: EditUserData;
  onSubmit: (formData: EditUserData) => void;
}

const AdminEditForm = ({ userData, onSubmit }: AdminEditFormProps): JSX.Element => {
  const [formData, setFormData] = useState<EditUserData>(userData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email:</label>
        <input type="email" name="email" value={formData.email ?? ''} readOnly />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password" value="********" readOnly />
      </div>
      <div>
        <label>Role:</label>
        <select name="role" value={formData.role ?? ''} onChange={handleChange} required>
          {Object.values(UserRole).map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Availability:</label>
        <input
          type="checkbox"
          name="availability"
          checked={formData.availability ?? false}
          onChange={handleCheckboxChange}
        />
      </div>
      <div>
        <label>Full Name:</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName ?? ''}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Phone:</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone ?? ''}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Gender:</label>
        <select name="gender" value={formData.gender ?? ''} onChange={handleChange} required>
          {Object.values(Gender).map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Address:</label>
        <input type="text" name="address" value={formData.address ?? ''} onChange={handleChange} />
      </div>
      <div>
        <label>Profile Photo Path:</label>
        <input
          type="text"
          name="profilePhotoPath"
          value={formData.profilePhotoPath ?? ''}
          onChange={handleChange}
        />
      </div>
      <button type="submit">Update User</button>
    </form>
  );
};

export default AdminEditForm;
