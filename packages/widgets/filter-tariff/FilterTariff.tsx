import React from 'react';
import { CreateOrderData, ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { UseFormSetValue, FieldErrors } from 'react-hook-form';

interface FilterTariffProps {
  tariffs: ExtendedTariff[];
  formData: Partial<CreateOrderData>;
  handleTariffChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedTariff: ExtendedTariff | null;
  selectedAdditionalServices: string[];
  handleAdditionalServiceChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    serviceUuid: string,
  ) => void;
  handleVehicleTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedVehicleType: string;
  vehicleTypes: string[];
  handleServiceLevelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedServiceLevel: string;
  serviceLevels: string[];
  setValue: UseFormSetValue<CreateOrderData>;
  errors: FieldErrors<CreateOrderData>;
}

const FilterTariff: React.FC<FilterTariffProps> = ({
  tariffs,
  formData,
  handleTariffChange,
  selectedTariff,
  selectedAdditionalServices,
  handleAdditionalServiceChange,
  handleVehicleTypeChange,
  selectedVehicleType,
  vehicleTypes,
  handleServiceLevelChange,
  selectedServiceLevel,
  serviceLevels,
  setValue,
  errors,
}) => {
  return (
    <div className="flex flex-col gap-4 p-4 border rounded-md shadow-md">
      <label>
        Vehicle Type:
        <select onChange={handleVehicleTypeChange} value={selectedVehicleType}>
          <option value="">Select a vehicle type</option>
          {vehicleTypes.map((vt) => (
            <option key={vt} value={vt}>
              {vt}
            </option>
          ))}
        </select>
      </label>
      <label>
        Service Level:
        <select onChange={handleServiceLevelChange} value={selectedServiceLevel}>
          <option value="">Select a service level</option>
          {serviceLevels.map((sl) => (
            <option key={sl} value={sl}>
              {sl}
            </option>
          ))}
        </select>
      </label>
      <label>
        Tariff:
        <select
          defaultValue={formData.tariffUuid || ''}
          onChange={(e) => {
            handleTariffChange(e);
            setValue('tariffUuid', e.target.value);
          }}
        >
          <option value="">Select a tariff</option>
          {tariffs.map((t) => (
            <option key={t.uuid} value={t.uuid}>
              {t.name}
            </option>
          ))}
        </select>
        {errors.tariffUuid && <span className="text-red-500">{errors.tariffUuid.message}</span>}
      </label>
      {selectedTariff && selectedTariff.tariffAdditionalServices?.length > 0 && (
        <div>
          {selectedTariff.tariffAdditionalServices.map((s) => (
            <label key={s.uuid} style={{ display: 'block' }}>
              <input
                type="checkbox"
                checked={selectedAdditionalServices.includes(s.uuid)}
                onChange={(e) => handleAdditionalServiceChange(e, s.uuid)}
              />
              {s.name} ({s.price})
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterTariff;
