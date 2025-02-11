import React from 'react';
import { CheckboxInput } from '@shared/components/ui/inputs';

interface AdditionalServiceItemProps {
  serviceUuid: string;
  name: string;
  isAvailable: boolean;
  price: number;
  isChecked: boolean;
  onAdditionalServiceChange: (additionalServiceUuid: string, isChecked: boolean) => void;
}

const AdditionalServiceItem: React.FC<AdditionalServiceItemProps> = ({
  serviceUuid,
  name,
  isAvailable,
  price,
  isChecked,
  onAdditionalServiceChange,
}) => {
  return (
    <li key={serviceUuid} className="flex items-center">
      <CheckboxInput
        label={`${name} ${isAvailable ? `(${price}с)` : ''}`}
        checked={isChecked}
        onChange={(e) => onAdditionalServiceChange(serviceUuid, e.target.checked)}
        disabled={!isAvailable}
        className={!isAvailable ? 'opacity-50 line-through' : ''}
      />
    </li>
  );
};

export default AdditionalServiceItem;
