'use client';

import React from 'react';
import { LazyImage } from '@shared/components/ui/images';
import { IButton } from '@shared/components/ui/buttons';
import { useRouter } from 'next/navigation';
import {
  vehicleSeats,
  vehicleTypeOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';
import { cn } from '@shared/lib';
import { openModal } from '@shared/lib/effector';

interface TariffTypesProps {
  tariff: DetailTariffData;
  mode?: string;
  onSelectTariff: (tariff: DetailTariffData) => void;
  selectedTariff: DetailTariffData | undefined;
  clientCorp?: boolean;
}

const TariffTypes: React.FC<TariffTypesProps> = ({
  tariff,
  mode,
  onSelectTariff,
  selectedTariff,
  clientCorp,
}) => {
  const router = useRouter();

  const { uuid, name, vehicleType, additionalPointPrice, tariffAdditionalServices = [] } = tariff;

  //Используем метод find для поиска перевода типа транспортного средства
  const vehicleTypeOption = vehicleTypeOptions.find((option) => option.value === vehicleType);
  const translatedVehicleType = vehicleTypeOption ? vehicleTypeOption.label : vehicleType;
  const seats = vehicleSeats[vehicleType] || '';

  const totalPrice = tariffAdditionalServices.reduce(
    (sum, service) => sum + service.price,
    additionalPointPrice,
  );

  const handleEdit = () => {
    router.push(`/tariff-management/edit/${uuid}`);
  };

  const handleCreate = () => {
    openModal('createClientCorpOrder');
  };

  const isActive = selectedTariff?.uuid === tariff.uuid;

  return (
    <div
      className={cn(
        'min-w-[284px] flex flex-col relative rounded-xl p-4 gap-4 cursor-pointer bg-white transition-all duration-75',
        {
          'shadow-lg outline': isActive,
        },
      )}
      onClick={() => onSelectTariff(tariff)}
    >
      <LazyImage
        src={`/images/tariff/${vehicleType?.toLowerCase() || 'default'}.png`}
        alt={translatedVehicleType || 'Default Vehicle'}
        className="w-[253px] h-[99px] object-contain pointer-events-none select-none"
      />
      <div className="w-full flex flex-col gap-2 justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-helvetica-neue text-4 leading-5 font-bold truncate">
            <strong>{name}</strong>
          </h1>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="font-helvetica-neue text-sm leading-5 text-black/50">
            Пассажирские места:
          </h4>
          <p className="p-[9px] flex items-center justify-center bg-[#989898] border border-gray-200 rounded-lg font-normal text-[22px] text-white">
            {seats}
          </p>
          <p className="p-[10px] flex items-center justify-center border border-gray-200 rounded-lg font-normal text-base">
            {translatedVehicleType}
          </p>

          <IButton
            onClick={clientCorp ? handleCreate : handleEdit}
            className="w-full h-[40px] border-none bg-[color:var(--button-secondary)] rounded-lg
            text-white font-semibold transition duration-300 ease-in-out
            hover:bg-[color:var(--button-secondary-hover)]"
            textClassName="text-end text-4 leading-4 font-normal justify-center"
          >
            {clientCorp ? 'Выбрать тариф' : mode === 'createOrder' ? 'Выбрать' : 'Редактировать'}
          </IButton>

          <p className="font-helvetica-neue text-sm leading-5 text-end text-black/50 pl-3 pt-3">
            Цена: <strong className="text-black text-5xl">{totalPrice}₽</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TariffTypes;
