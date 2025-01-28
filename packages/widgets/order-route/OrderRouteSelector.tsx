import React from 'react';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';

interface OrderStartEndSelectorProps {
  formData: Partial<CreateOrderData>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  getAvailablePoints: (exclude: string[]) => any[];
}

const OrderStartEndSelector: React.FC<OrderStartEndSelectorProps> = ({
  formData,
  handleChange,
  getAvailablePoints,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md shadow-md">
      <label>
        Departure Time:
        <input
          type="datetime-local"
          name="departureTime"
          value={formData.departureTime || ''}
          onChange={handleChange}
        />
      </label>
      <label>
        Departure Point:
        <select name="departurePoint" onChange={handleChange} value={formData.departurePoint || ''}>
          <option value="">Select a departure point</option>
          {getAvailablePoints([
            formData.arrivalPoint || '',
            ...(formData.intermediatePoints || []),
          ]).map((p) => (
            <option key={p.uuid} value={p.uuid}>
              {p.address}
            </option>
          ))}
        </select>
      </label>

      <label>
        Arrival Point:
        <select name="arrivalPoint" onChange={handleChange} value={formData.arrivalPoint || ''}>
          <option value="">Select an arrival point</option>
          {getAvailablePoints([
            formData.departurePoint || '',
            ...(formData.intermediatePoints || []),
          ]).map((p) => (
            <option key={p.uuid} value={p.uuid}>
              {p.address}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default OrderStartEndSelector;
