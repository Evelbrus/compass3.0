'use client';

import React from 'react';
import { LazyImage } from '@shared/components/ui/images';
import { IButton } from '@shared/components/ui/buttons';
import { useRouter } from 'next/navigation';
import { vehicleTypeOptions } from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';
import { cn } from '@shared/lib';

interface TariffTypesProps {
  tariff: DetailTariffData;
  mode?: string;
  onSelectTariff: (tariff: DetailTariffData) => void;
  selectedTariff: DetailTariffData | undefined;
}

const TariffTypes: React.FC<TariffTypesProps> = ({
  tariff,
  mode,
  onSelectTariff,
  selectedTariff,
}) => {
  const router = useRouter();

  const {
    uuid,
    name,
    vehicleType,
    description,
    additionalPointPrice,
    tariffAdditionalServices = [],
    serviceLevel,
  } = tariff;

  //Используем метод find для поиска перевода типа транспортного средства
  const vehicleTypeOption = vehicleTypeOptions.find((option) => option.value === vehicleType);
  const translatedVehicleType = vehicleTypeOption ? vehicleTypeOption.label : vehicleType;

  const totalPrice = tariffAdditionalServices.reduce(
    (sum, service) => sum + service.price,
    additionalPointPrice,
  );

  const handleEdit = () => {
    router.push(`/tariff-management/detail/${uuid}`);
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
          <p className="font-helvetica-neue text-3 leading-3 text-gray-500 font-bold">
            Тип автомобиля: <strong>{translatedVehicleType}</strong>
          </p>
          <p className="font-helvetica-neue text-3 leading-3 text-gray-500 font-bold">
            Уровень обслуживания: <strong>{serviceLevel}</strong>
          </p>
          {description && (
            <p
              className="font-helvetica-neue text-3 leading-4 text-gray-500 font-bold break-words"
              style={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}
            >
              Описание: <strong>{description}</strong>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-helvetica-neue text-5 leading-5 text-center text-black p-3 bg-gray-200 rounded-lg">
            Цена: <strong>{totalPrice}₽</strong>
          </p>
          {/*Кнопка редактирования */}
          <IButton
            onClick={handleEdit}
            className="w-full h-[40px] border-none bg-[color:var(--button-secondary)] rounded-lg
                  text-white font-semibold transition duration-300 ease-in-out
                  hover:bg-[color:var(--button-secondary-hover)]"
            textClassName="text-end text-4 leading-4 text-medium justify-center"
          >
            {mode === 'createOrder' ? 'Выбрать' : 'Редактировать'}
          </IButton>
        </div>
      </div>
    </div>
  );
};

export default TariffTypes;
