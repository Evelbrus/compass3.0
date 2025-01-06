'use client';

import React, { useState } from 'react';
import { LazyImage } from '@shared/components/ui/images';
import { IButton } from '@shared/components/ui/buttons';
import { useRouter } from 'next/navigation';
import { vehicleTypeOptions } from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import { clientTypeOptions } from '@shared/lib/effector/tariff/optionsTranslation/optionsTranslationTariff';
import { SelectSingle } from '@shared/components/ui/inputs';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';

interface TariffProps {
  tariff: DetailTariffData;
  mode?: string;
}

const Tariff: React.FC<TariffProps> = ({ tariff, mode }) => {
  const router = useRouter();

  const {
    uuid,
    name,
    clientType,
    vehicleTypes = [],
    description,
    additionalPointPrice,
    tariffOnServiceLevels = [],
  } = tariff;

  const translatedClientType = clientTypeOptions[clientType] || clientType;
  const translatedVehicleTypes = vehicleTypes.map((type) => vehicleTypeOptions[type] || type);

  //Состояние для выбранного уровня обслуживания
  const initialServiceLevel = tariffOnServiceLevels.length > 0 ? tariffOnServiceLevels[0] : null;
  const [selectedServiceLevel, setSelectedServiceLevel] = useState(initialServiceLevel);

  //Опции для селектора уровней обслуживания
  const serviceLevelOptions = tariffOnServiceLevels.map((level) => ({
    value: level.service.uuid,
    label: level.service.name,
  }));

  //Обработчик изменения уровня обслуживания
  const handleServiceLevelChange = (option: { value: string; label: string } | null) => {
    if (option) {
      const selected = tariffOnServiceLevels.find((level) => level.service.uuid === option.value);
      if (selected) setSelectedServiceLevel(selected);
    }
  };

  //Сложение прайсов
  const totalPrice = selectedServiceLevel
    ? selectedServiceLevel.service.price + additionalPointPrice
    : additionalPointPrice;

  //Обработчик редактирования
  const handleEdit = () => {
    router.push(`/tariff-management/detail/${uuid}`);
  };

  return (
    <div className="min-w-[284px] flex flex-col relative bg-white rounded-xl p-4 gap-4 cursor-default">
      {/*Изображение */}
      <LazyImage
        src={`/images/tariff/${vehicleTypes[0]?.toLowerCase() || 'default'}.png`}
        alt={translatedVehicleTypes[0] || 'Default Vehicle'}
        className="w-[253px] h-[99px] object-contain pointer-events-none select-none"
      />
      {/*Информация о тарифе */}
      <div className="w-full flex flex-col gap-2 justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="font-helvetica-neue text-4 leading-5 font-bold truncate">
            <strong>{name}</strong>
          </h1>
          {/*Уровень обслуживания */}
          <div className="flex flex-col gap-2">
            <p className="font-helvetica-neue text-3 leading-3 font-bold">Уровень обслуживания:</p>
            {tariffOnServiceLevels.length > 1 ? (
              <SelectSingle
                options={serviceLevelOptions}
                value={
                  selectedServiceLevel
                    ? {
                        value: selectedServiceLevel.service.uuid,
                        label: selectedServiceLevel.service.name,
                      }
                    : null
                }
                onChange={handleServiceLevelChange}
                placeholder="Выберите уровень"
                className="w-full"
              />
            ) : (
              <div className="font-helvetica-neue text-5 leading-5 text-center text-black p-3 bg-gray-200 rounded-lg">
                {selectedServiceLevel?.service.name}
              </div>
            )}
          </div>
          <p className="font-helvetica-neue text-3 leading-3 text-gray-500 font-bold">
            Тип клиента: <strong>{translatedClientType}</strong>
          </p>
          <p className="font-helvetica-neue text-3 leading-3 text-gray-500 font-bold">
            Типы автомобилей: <strong>{translatedVehicleTypes.join(', ')}</strong>
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
        {/*Прайс */}
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

export default Tariff;
