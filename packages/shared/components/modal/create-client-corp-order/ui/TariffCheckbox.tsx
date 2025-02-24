import React, { useCallback, useMemo } from 'react';
import { Control, Controller } from 'react-hook-form';
import { ServiceLevels, VehicleType, Tariff } from '@prisma/client';
import { cn } from '@shared/lib';
import { LazyImage } from '@shared/components/ui/images';
import { CheckboxInput } from '@shared/components/ui/inputs';
import { CreateClientCorpOrderData } from '@shared/components/modal/create-client-corp-order/hooks/useCreateClientCorpOrder';
import {
  serviceLevelOptions,
  vehicleTypeOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';
import DepartureTimeInput from '@shared/components/modal/create-client-corp-order/ui/DepartureTimeInput';

interface TariffCheckboxProps {
  control: Control<CreateClientCorpOrderData>;
  tariffs: Tariff[];
  selectedServiceLevel: ServiceLevels | undefined;
  selectedVehicleType: VehicleType | undefined;
  selectedTariffUuid: string | null;
  handleServiceLevelChange: (level: ServiceLevels) => void;
  handleVehicleTypeChange: (type: VehicleType) => void;
  watch: <K extends keyof CreateClientCorpOrderData>(field: K) => CreateClientCorpOrderData[K];
}

const TariffCheckbox: React.FC<TariffCheckboxProps> = ({
  control,
  tariffs,
  selectedTariffUuid,
  handleServiceLevelChange,
  handleVehicleTypeChange,
  watch,
}) => {
  const vehicleTypeValue = watch('vehicleType');
  const serviceLevelValue = watch('serviceLevel');

  const translatedVehicleType = useMemo(() => {
    const selectedOption = vehicleTypeOptions.find((option) => option.value === vehicleTypeValue);
    return selectedOption ? selectedOption.label : 'Транспорт';
  }, [vehicleTypeValue]);

  const selectedTariff = useMemo(() => {
    if (!selectedTariffUuid) {
      return null;
    }
    return tariffs.find((tariff) => tariff.uuid === selectedTariffUuid) || null;
  }, [selectedTariffUuid, tariffs, vehicleTypeValue, serviceLevelValue]);

  const isServiceLevelAvailable = useCallback(
    (level: ServiceLevels, vehicleType: VehicleType): boolean => {
      return tariffs.some(
        (tariff) => tariff.serviceLevel === level && tariff.vehicleType === vehicleType,
      );
    },
    [tariffs],
  );

  return (
    <div className="w-full flex flex-row flex-wrap justify-between gap-4">
      <div className={'flex-1 flex flex-col gap-4'}>
        <div className={'flex flex-row flex-wrap gap-4'}>
          <div className={'flex-1 flex flex-col gap-4'}>
            <label className="block text-gray-700 text-[20px] font-bold">Транспорт:</label>
            {vehicleTypeOptions
              .filter((option) => option.value !== 'None')
              .map((typeOption) => (
                <div key={typeOption.value} className="mb-2">
                  <Controller
                    name="vehicleType"
                    control={control}
                    render={({ field }) => (
                      <CheckboxInput
                        label={typeOption.label}
                        checked={field.value === typeOption.value}
                        onChange={() => handleVehicleTypeChange(typeOption.value)}
                      />
                    )}
                  />
                </div>
              ))}
          </div>
          <div className={'flex-1 flex flex-col gap-4'}>
            <label className="block text-gray-700 text-[20px] font-bold">Класс:</label>
            {serviceLevelOptions
              .filter((option) => option.value !== 'None')
              .map((levelOption) => {
                const isAvailable = vehicleTypeValue
                  ? isServiceLevelAvailable(levelOption.value, vehicleTypeValue)
                  : true;
                return (
                  <div key={levelOption.value} className="mb-2">
                    <Controller
                      name="serviceLevel"
                      control={control}
                      render={({ field }) => (
                        <CheckboxInput
                          label={levelOption.label}
                          checked={field.value === levelOption.value}
                          onChange={() => handleServiceLevelChange(levelOption.value)}
                          disabled={!isAvailable}
                          className={!isAvailable ? 'opacity-50 line-through' : ''}
                        />
                      )}
                    />
                    {!isAvailable && <p className="text-xs text-gray-500">Не обслуживается</p>}
                  </div>
                );
              })}
          </div>
        </div>
        <DepartureTimeInput control={control} />
      </div>

      <div>
        <TariffCard
          selectedTariff={selectedTariff}
          selectedVehicleType={vehicleTypeValue}
          translatedVehicleType={translatedVehicleType}
          selectedServiceLevel={serviceLevelValue}
        />
      </div>
    </div>
  );
};

interface TariffCardProps {
  selectedTariff: Tariff | null;
  selectedVehicleType: VehicleType | undefined;
  translatedVehicleType: string;
  selectedServiceLevel: ServiceLevels | undefined;
}

const TariffCard: React.FC<TariffCardProps> = ({
  selectedTariff,
  selectedVehicleType,
  translatedVehicleType,
  selectedServiceLevel,
}) => {
  const translatedServiceLevel = useMemo(() => {
    const selectedOption = serviceLevelOptions.find(
      (option) => option.value === selectedServiceLevel,
    );
    return selectedOption ? selectedOption.label : 'Класс';
  }, [selectedServiceLevel]);

  const seatInfo = useMemo(() => {
    switch (selectedVehicleType) {
      case 'Sedan':
        return '4 пас. места';
      case 'Minivan':
        return '6-7 пас. мест';
      case 'Sprinter':
        return 'до 18 пас. мест';
      case 'Bus':
        return '27-30 пас. мест';
      default:
        return '';
    }
  }, [selectedVehicleType]);

  return (
    <div
      className={cn(
        'flex flex-col relative rounded-xl p-4 gap-4 cursor-pointer bg-white transition-all duration-75 border-2',
      )}
    >
      <LazyImage
        src={`/images/tariff/${selectedVehicleType?.toLowerCase() || 'default'}.png`}
        alt={translatedVehicleType || 'Default Vehicle'}
        className="w-[253px] h-[99px] object-contain pointer-events-none select-none"
      />
      <div className="w-[253px] flex flex-col gap-2 justify-between">
        {selectedTariff ? (
          <>
            <div className="flex flex-col gap-2">
              <h1 className="font-helvetica-neue text-4 leading-5 font-bold truncate">
                <strong>{selectedTariff.name}</strong>
              </h1>
            </div>
            <div className="flex flex-col gap-2">
              <p className="p-[9px] flex items-center justify-center bg-[#989898] border border-gray-200 rounded-lg font-normal text-22px text-white">
                {translatedServiceLevel}
              </p>
              <p className="p-[10px] flex items-center justify-center border border-gray-200 rounded-lg font-normal text-base">
                {translatedVehicleType}
              </p>
              {seatInfo && (
                <p className="p-[10px] flex items-center justify-center border border-gray-200 rounded-lg font-normal text-base">
                  {seatInfo}
                </p>
              )}
              <p className="font-helvetica-neue text-sm leading-5 text-end text-black/50 pl-3 pt-3">
                Мин. цена: <strong className="text-black text-5xl">{selectedTariff.price}С</strong>
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-gray-500">
            Выберите тип авто и уровень обслуживания
          </div>
        )}
      </div>
    </div>
  );
};

export default TariffCheckbox;
