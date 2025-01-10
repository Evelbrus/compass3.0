import React, { JSX } from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { TextInput, DateInput } from '@shared/components/ui/inputs';
import { IButton } from '@shared/components/ui/buttons';

const DriverEditStep4 = (): JSX.Element => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'driverProfile.driverExperience',
  });

  return (
    <div className="flex flex-col justify-center">
      {fields.map((item, index) => (
        <div key={item.id} className="mb-4 grid grid-cols-2 gap-x-8 gap-y-4 p-6">
          <div className="col-span-1">
            <label className="block mb-2 font-bold">Company Name:</label>
            <Controller
              name={`driverProfile.driverExperience.${index}.companyName`}
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
          <div className="col-span-1">
            <label className="block mb-2 font-bold">Position:</label>
            <Controller
              name={`driverProfile.driverExperience.${index}.position`}
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
          <div className="col-span-1">
            <label className="block mb-2 font-bold">From:</label>
            <Controller
              name={`driverProfile.driverExperience.${index}.from`}
              control={control}
              render={({ field, fieldState }) => (
                <DateInput
                  selectedDate={field.value || null}
                  onChange={field.onChange}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                  placeholder="Select date"
                />
              )}
            />
          </div>
          <div className="col-span-1">
            <label className="block mb-2 font-bold">To:</label>
            <Controller
              name={`driverProfile.driverExperience.${index}.to`}
              control={control}
              render={({ field, fieldState }) => (
                <DateInput
                  selectedDate={field.value || null}
                  onChange={field.onChange}
                  error={!!fieldState.error}
                  message={fieldState.error?.message || ''}
                  placeholder="Select date"
                />
              )}
            />
          </div>
          <div className="col-span-2 flex justify-end">
            <IButton
              type="button"
              onClick={() => remove(index)}
              className="w-[205px] p-3 bg-red-500 text-[color:var(--text-white)] rounded-lg hover:bg-red-700 transition"
              textClassName="w-full text-center justify-center"
            >
              Remove Experience
            </IButton>
          </div>
        </div>
      ))}
      <IButton
        type="button"
        onClick={() => append({ companyName: '', position: '', from: null, to: null })}
        className="w-[205px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition"
        textClassName="w-full text-center justify-center"
      >
        Add Experience
      </IButton>
    </div>
  );
};

export default DriverEditStep4;
