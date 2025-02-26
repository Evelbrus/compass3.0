import React, { useCallback, useMemo } from 'react';
import { Control, Controller, UseFormWatch } from 'react-hook-form';
import { ServiceLevels, VehicleType, Tariff } from '@prisma/client';
import { cn } from '@shared/lib';
import { LazyImage } from '@shared/components/ui/images';
import { CheckboxInput } from '@shared/components/ui/inputs';
import { FormOrderValues } from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import {
  serviceLevelOptions,
  vehicleTypeOptions,
} from '@shared/lib/effector/vehicles/optionsTranslation/optionsTranslationVehicle';

interface TariffCheckboxProps {
  control: Control<FormOrderValues>;
  tariffs: Tariff[];
  selectedServiceLevel: ServiceLevels | undefined;
  selectedVehicleType: VehicleType | undefined;
  selectedTariffUuid: string | null;
  handleServiceLevelChange: (level: ServiceLevels) => void;
  handleVehicleTypeChange: (type: VehicleType) => void;
  watch: UseFormWatch<FormOrderValues>;
  refetchDrivers?: (
    search: string,
    vehicleType?: VehicleType,
    serviceLevel?: ServiceLevels,
  ) => void;
}

const TariffCheckbox: React.FC<TariffCheckboxProps> = ({
  control,
  tariffs,
  selectedTariffUuid,
  handleServiceLevelChange,
  handleVehicleTypeChange,
  watch,
  refetchDrivers,
}) => {
  const vehicleTypeValue = watch('vehicleType');
  const serviceLevelValue = watch('serviceLevel');

  const translatedVehicleType = useMemo(() => {
    const selectedOption = vehicleTypeOptions.find((option) => option.value === vehicleTypeValue);
    return selectedOption ? selectedOption.label : 'Транспорт';
  }, [vehicleTypeValue]);

  const selectedTariff = useMemo(() => {
    if (!selectedTariffUuid) return null;
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

  const handleVehicleTypeChangeWithDrivers = useCallback(
    (type: VehicleType) => {
      handleVehicleTypeChange(type);

      const firstAvailableServiceLevel = serviceLevelOptions
        .filter((option) => option.value !== 'None')
        .find((levelOption) => isServiceLevelAvailable(levelOption.value, type));

      if (firstAvailableServiceLevel) {
        const newServiceLevel = firstAvailableServiceLevel.value;
        handleServiceLevelChange(newServiceLevel);
        if (refetchDrivers) {
          refetchDrivers('', type, newServiceLevel);
        }
      } else if (refetchDrivers) {
        refetchDrivers('', type, serviceLevelValue);
      }
    },
    [
      handleVehicleTypeChange,
      serviceLevelValue,
      refetchDrivers,
      isServiceLevelAvailable,
      handleServiceLevelChange,
    ],
  );

  const handleServiceLevelChangeWithDrivers = useCallback(
    (level: ServiceLevels) => {
      handleServiceLevelChange(level);
      if (refetchDrivers) {
        refetchDrivers('', vehicleTypeValue, level);
      }
    },
    [handleServiceLevelChange, vehicleTypeValue, refetchDrivers],
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
                        onChange={() => handleVehicleTypeChangeWithDrivers(typeOption.value)}
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
                          onChange={() => handleServiceLevelChangeWithDrivers(levelOption.value)}
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

        <Controller
          name="departureTime"
          control={control}
          render={({ field }) => {
            const formatDateForInput = (date: any): string => {
              if (!date) return '';
              const d = date instanceof Date ? date : new Date(date);
              if (isNaN(d.getTime())) return '';
              const pad = (num: number) => num.toString().padStart(2, '0');
              const year = d.getFullYear();
              const month = pad(d.getMonth() + 1);
              const day = pad(d.getDate());
              const hours = pad(d.getHours());
              const minutes = pad(d.getMinutes());
              return `${year}-${month}-${day}T${hours}:${minutes}`;
            };

            return (
              <div className="mb-4">
                <label className="block text-gray-700 text-[20px] font-bold mb-2">
                  Время подачи:
                </label>
                <input
                  type="datetime-local"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => {
                    if (e.target.value) {
                      const date = new Date(e.target.value);
                      if (!isNaN(date.getTime())) {
                        field.onChange(date);
                      } else {
                        // Обработка недопустимой даты, например, сброс поля или вывод ошибки
                        console.error('Недопустимая дата');
                        field.onChange(null);
                      }
                    } else {
                      field.onChange(null);
                    }
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  className="p-2 border rounded w-full"
                />
              </div>
            );
          }}
        />
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
