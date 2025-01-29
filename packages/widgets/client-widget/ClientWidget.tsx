import React from 'react';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { User } from '@prisma/client';
import { FieldErrors, UseFormSetValue } from 'react-hook-form';

interface ClientWidgetProps {
  formData: Partial<CreateOrderData>;
  setValue: UseFormSetValue<CreateOrderData>;
  clients: User[];
  errors: FieldErrors<CreateOrderData>;
}

const ClientWidget: React.FC<ClientWidgetProps> = ({ formData, clients, setValue, errors }) => {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md shadow-md">
      <label>
        Client:
        <select
          defaultValue={formData.createdBy || ''}
          onChange={(e) => setValue('createdBy', e.target.value)}
        >
          <option value="">Select a client</option>
          {clients.map((c) => (
            <option key={c.uuid} value={c.uuid}>
              {c.email}
            </option>
          ))}
        </select>
        {errors.createdBy && <span className="text-red-500">{errors.createdBy.message}</span>}
      </label>
      <label>
        Description:
        <input
          type="text"
          defaultValue={formData.description || ''}
          onChange={(e) => setValue('description', e.target.value)}
        />
        {errors.description && <span className="text-red-500">{errors.description.message}</span>}
      </label>
    </div>
  );
};

export default ClientWidget;
