import React from 'react';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';

interface TariffSelectorProps {
  tariffs: DetailTariffData[];
  selectedTariff: string;
  onTariffChange: (tariffUuid: string) => void;
}

const TariffSelector: React.FC<TariffSelectorProps> = ({
  tariffs,
  selectedTariff,
  onTariffChange,
}) => (
  <div>
    <label htmlFor="tariff">Тариф</label>
    <select id="tariff" value={selectedTariff} onChange={(e) => onTariffChange(e.target.value)}>
      <option value="">Выберите тариф</option>
      {tariffs.map((tariff) => (
        <option key={tariff.uuid} value={tariff.uuid}>
          {tariff.name}
        </option>
      ))}
    </select>
  </div>
);

export default TariffSelector;
