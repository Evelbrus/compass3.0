'use client';

import React, { JSX, useState } from 'react';
import {
  Gender,
  Status,
  Citizenship,
  IdentityDocument,
  ChangingDriver,
  RateType,
} from '@prisma/client';
import { EditUserData } from '@shared/prisma/interface/users/interface';

interface DriverEditFormProps {
  userData: EditUserData;
  onSubmit: (formData: EditUserData) => void;
}

const DriverEditForm = ({ userData, onSubmit }: DriverEditFormProps): JSX.Element => {
  const [formData, setFormData] = useState<EditUserData>(userData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    const [parent, child] = name.split('.');

    if (child) {
      setFormData((prevData) => ({
        ...prevData,
        [parent]: {
          ...prevData[parent],
          [child]: name === 'driverProfile.yearsOfDriving' ? parseInt(value) : value,
        },
      }));
    } else {
      setFormData({
        ...formData,
        [name]: newValue,
      });
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');

    if (child) {
      setFormData((prevData) => ({
        ...prevData,
        [parent]: {
          ...prevData[parent],
          [child]: value ? new Date(value) : null,
        },
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value ? new Date(value) : null,
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
        <input type="email" name="email" value={formData.email ?? ''} readOnly />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" name="password" value="********" readOnly />
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
      <div>
        <h2>Driver Profile</h2>
        <div>
          <label>Status:</label>
          <select
            name="driverProfile.status"
            value={formData.driverProfile?.status ?? Status.None}
            onChange={handleChange}
          >
            {Object.values(Status).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Citizenship:</label>
          <select
            name="driverProfile.citizenship"
            value={formData.driverProfile?.citizenship ?? Citizenship.None}
            onChange={handleChange}
          >
            {Object.values(Citizenship).map((citizenship) => (
              <option key={citizenship} value={citizenship}>
                {citizenship}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Identity Document:</label>
          <select
            name="driverProfile.identityDocument"
            value={formData.driverProfile?.identityDocument ?? IdentityDocument.None}
            onChange={handleChange}
          >
            {Object.values(IdentityDocument).map((identityDocument) => (
              <option key={identityDocument} value={identityDocument}>
                {identityDocument}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Passport ID:</label>
          <input
            type="text"
            name="driverProfile.passportId"
            value={formData.driverProfile?.passportId ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Passport Issue Date:</label>
          <input
            type="date"
            name="driverProfile.passportIssueDate"
            value={
              formData.driverProfile?.passportIssueDate
                ? new Date(formData.driverProfile.passportIssueDate).toISOString().split('T')[0]
                : ''
            }
            onChange={handleDateChange}
          />
        </div>
        <div>
          <label>Passport Issued By:</label>
          <input
            type="text"
            name="driverProfile.passportIssued"
            value={formData.driverProfile?.passportIssued ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Birth Date:</label>
          <input
            type="date"
            name="driverProfile.birthDate"
            value={
              formData.driverProfile?.birthDate
                ? new Date(formData.driverProfile.birthDate).toISOString().split('T')[0]
                : ''
            }
            onChange={handleDateChange}
          />
        </div>
        <div>
          <label>Birth Place:</label>
          <input
            type="text"
            name="driverProfile.birthPlace"
            value={formData.driverProfile?.birthPlace ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Actual Address:</label>
          <input
            type="text"
            name="driverProfile.actualAddress"
            value={formData.driverProfile?.actualAddress ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Permanent Address:</label>
          <input
            type="text"
            name="driverProfile.permanentAddress"
            value={formData.driverProfile?.permanentAddress ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Changing Driver:</label>
          <select
            name="driverProfile.changingDriver"
            value={formData.driverProfile?.changingDriver ?? ChangingDriver.None}
            onChange={handleChange}
          >
            {Object.values(ChangingDriver).map((changingDriver) => (
              <option key={changingDriver} value={changingDriver}>
                {changingDriver}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Type of Driver:</label>
          <input
            type="text"
            name="driverProfile.typeDriver"
            value={formData.driverProfile?.typeDriver ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Rate Type:</label>
          <select
            name="driverProfile.rateDriver"
            value={formData.driverProfile?.rateDriver ?? RateType.None}
            onChange={handleChange}
          >
            {Object.values(RateType).map((rateDriver) => (
              <option key={rateDriver} value={rateDriver}>
                {rateDriver}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Years of Driving:</label>
          <input
            type="number"
            name="driverProfile.yearsOfDriving"
            value={formData.driverProfile?.yearsOfDriving ?? 0}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Passport Photo Path:</label>
          <input
            type="text"
            name="driverProfile.passportPhotoPath"
            value={formData.driverProfile?.passportPhotoPath ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>License Photo Path:</label>
          <input
            type="text"
            name="driverProfile.licensePhotoPath"
            value={formData.driverProfile?.licensePhotoPath ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Bank Name:</label>
          <input
            type="text"
            name="driverProfile.bankName"
            value={formData.driverProfile?.bankName ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Bank BIC:</label>
          <input
            type="text"
            name="driverProfile.bankBic"
            value={formData.driverProfile?.bankBic ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Bank Account Number:</label>
          <input
            type="text"
            name="driverProfile.bankAccountNumber"
            value={formData.driverProfile?.bankAccountNumber ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Card Number:</label>
          <input
            type="text"
            name="driverProfile.cardNumber"
            value={formData.driverProfile?.cardNumber ?? ''}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Profile Photo Path:</label>
          <input
            type="text"
            name="driverProfile.profilePhotoPath"
            value={formData.driverProfile?.profilePhotoPath ?? ''}
            onChange={handleChange}
          />
        </div>
      </div>
      <button type="submit">Update User</button>
    </form>
  );
};

export default DriverEditForm;
