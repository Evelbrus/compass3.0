'use client';

import React, { JSX } from 'react';
import { Citizenship, IdentityDocument, Status, ChangingDriver, RateType } from '@prisma/client';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput, PhoneInput } from '@shared/components/ui/inputs';
import { validatePhoneNumber } from '@shared/utils/validations';

const DriverCreateStep2 = (): JSX.Element => {
  const { control } = useFormContext();

  return (
    <div className="flex flex-col p-5 justify-center bg-white border rounded-xl">
      <h1 className={'text-6 leading-6 mt-4 mb-2 pl-6 font-extrabold'}>
        Создание Водителя - Профиль Водителя
      </h1>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 p-6">
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Status:</label>
          <Controller
            name="driverProfile.status"
            control={control}
            render={({ field, fieldState }) => (
              <select {...field} className="w-full p-2 border rounded">
                {Object.values(Status).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Citizenship:</label>
          <Controller
            name="driverProfile.citizenship"
            control={control}
            render={({ field, fieldState }) => (
              <select {...field} className="w-full p-2 border rounded">
                {Object.values(Citizenship).map((citizenship) => (
                  <option key={citizenship} value={citizenship}>
                    {citizenship}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Identity Document:</label>
          <Controller
            name="driverProfile.identityDocument"
            control={control}
            render={({ field, fieldState }) => (
              <select {...field} className="w-full p-2 border rounded">
                {Object.values(IdentityDocument).map((identityDocument) => (
                  <option key={identityDocument} value={identityDocument}>
                    {identityDocument}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Passport ID:</label>
          <Controller
            name="driverProfile.passportId"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Passport Issue Date:</label>
          <Controller
            name="driverProfile.passportIssueDate"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="date"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Passport Issued By:</label>
          <Controller
            name="driverProfile.passportIssued"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Birth Date:</label>
          <Controller
            name="driverProfile.birthDate"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="date"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Birth Place:</label>
          <Controller
            name="driverProfile.birthPlace"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Actual Address:</label>
          <Controller
            name="driverProfile.actualAddress"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Permanent Address:</label>
          <Controller
            name="driverProfile.permanentAddress"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Changing Driver:</label>
          <Controller
            name="driverProfile.changingDriver"
            control={control}
            render={({ field, fieldState }) => (
              <select {...field} className="w-full p-2 border rounded">
                {Object.values(ChangingDriver).map((changingDriver) => (
                  <option key={changingDriver} value={changingDriver}>
                    {changingDriver}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Type of Driver:</label>
          <Controller
            name="driverProfile.typeDriver"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Rate Type:</label>
          <Controller
            name="driverProfile.rateDriver"
            control={control}
            render={({ field, fieldState }) => (
              <select {...field} className="w-full p-2 border rounded">
                {Object.values(RateType).map((rateDriver) => (
                  <option key={rateDriver} value={rateDriver}>
                    {rateDriver}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Years of Driving:</label>
          <Controller
            name="driverProfile.yearsOfDriving"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="number"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Passport Photo Path:</label>
          <Controller
            name="driverProfile.passportPhotoPath"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">License Photo Path:</label>
          <Controller
            name="driverProfile.licensePhotoPath"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Bank Name:</label>
          <Controller
            name="driverProfile.bankName"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Bank BIC:</label>
          <Controller
            name="driverProfile.bankBic"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Bank Account Number:</label>
          <Controller
            name="driverProfile.bankAccountNumber"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
        <div className="mb-4 col-span-1">
          <label className="block mb-2 font-bold">Card Number:</label>
          <Controller
            name="driverProfile.cardNumber"
            control={control}
            render={({ field, fieldState }) => (
              <TextInput
                type="text"
                {...field}
                error={!!fieldState.error}
                message={fieldState.error?.message || ''}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default DriverCreateStep2;
