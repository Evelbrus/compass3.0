'use client';

import React, { JSX, useState } from 'react';
import { Gender, UserRole } from '@prisma/client';
import { CreateUserData } from '@shared/prisma/interface/users/interface';

interface OperatorCreateFormProps {
  onSubmit: (formData: CreateUserData) => void;
}

const OperatorCreateForm = ({ onSubmit }: OperatorCreateFormProps): JSX.Element => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: UserRole.Operator,
    availability: true,
    fullName: '',
    phone: '',
    gender: Gender.Male,
    address: '',
    profilePhotoPath: '',
    companyProfile: {
      companyName: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      companyPin: '',
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');

    if (child) {
      setFormData((prevData) => ({
        ...prevData,
        [parent]: {
          ...prevData[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Availability:</label>
        <input
          type="checkbox"
          name="availability"
          checked={formData.availability}
          onChange={handleCheckboxChange}
        />
      </div>
      <div>
        <label>Full Name:</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Phone:</label>
        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
      </div>
      <div>
        <label>Gender:</label>
        <select name="gender" value={formData.gender} onChange={handleChange} required>
          {Object.values(Gender).map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Address:</label>
        <input type="text" name="address" value={formData.address} onChange={handleChange} />
      </div>
      <div>
        <label>Profile Photo Path:</label>
        <input
          type="text"
          name="profilePhotoPath"
          value={formData.profilePhotoPath}
          onChange={handleChange}
        />
      </div>
      <div>
        <h2>Company Profile</h2>
        <div>
          <label>Company Name:</label>
          <input
            type="text"
            name="companyProfile.companyName"
            value={formData.companyProfile.companyName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Company Email:</label>
          <input
            type="email"
            name="companyProfile.email"
            value={formData.companyProfile.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Company Phone:</label>
          <input
            type="tel"
            name="companyProfile.phone"
            value={formData.companyProfile.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Company Address:</label>
          <input
            type="text"
            name="companyProfile.address"
            value={formData.companyProfile.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Website:</label>
          <input
            type="text"
            name="companyProfile.website"
            value={formData.companyProfile.website}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Company PIN:</label>
          <input
            type="text"
            name="companyProfile.companyPin"
            value={formData.companyProfile.companyPin}
            onChange={handleChange}
          />
        </div>
      </div>
      <button type="submit">Create User</button>
    </form>
  );
};

export default OperatorCreateForm;
