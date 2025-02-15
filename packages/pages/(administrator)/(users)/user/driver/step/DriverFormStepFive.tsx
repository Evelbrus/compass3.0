import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput } from '@shared/components/ui/inputs';
import { UserCard } from '@pages/(administrator)/(users)/user/useClientsAdminForm';

const DriverFormStepFive: React.FC = () => {
  const { control } = useFormContext<UserCard>();

  return (
    <div className="flex flex-col p-6">
      <h3 className="text-lg font-semibold mb-4">Банковские данные</h3>

      <div className="grid grid-cols-2 gap-6">
        {/*Название банка */}
        <Controller
          name="driverProfile.bankName"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Название банка"
              type="text"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={!!fieldState.error}
              message={fieldState.error?.message || ''}
              placeholder="Введите название банка"
            />
          )}
        />

        {/*Номер счёта */}
        <Controller
          name="driverProfile.bankAccountNumber"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Номер счёта"
              type="number"
              value={field.value}
              onChange={field.onChange}
              error={!!fieldState.error}
              message={fieldState.error?.message || ''}
              placeholder="Введите номер счёта"
            />
          )}
        />

        {/*BIC банка */}
        <Controller
          name="driverProfile.bankBic"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="BIC банка"
              type="text"
              value={field.value ?? ''}
              onChange={field.onChange}
              error={!!fieldState.error}
              message={fieldState.error?.message || ''}
              placeholder="Введите BIC банка"
            />
          )}
        />

        {/*Номер карты */}
        <Controller
          name="driverProfile.cardNumber"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Номер карты"
              type="number"
              value={field.value}
              onChange={field.onChange}
              error={!!fieldState.error}
              message={fieldState.error?.message || ''}
              placeholder="Введите номер карты"
            />
          )}
        />
      </div>
    </div>
  );
};

export default DriverFormStepFive;
