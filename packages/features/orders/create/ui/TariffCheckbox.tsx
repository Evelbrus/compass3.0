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
import { debounce } from '@shared/utils/hooks/useDebounce';

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

// Стили для разных полей
const FIELD_STYLES = {
  card: {
    active: 'border-cyan-400 shadow-md shadow-cyan-100',
    focus: 'focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500',
    hover: 'hover:border-cyan-300 hover:shadow-sm hover:shadow-cyan-50',
  },
  input: {
    focus: 'focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500',
  },
};

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

  const debouncedVehicleTypeChange = useCallback(
    debounce((type: VehicleType) => {
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
    }, 300),
    [
      handleVehicleTypeChange,
      serviceLevelValue,
      refetchDrivers,
      isServiceLevelAvailable,
      handleServiceLevelChange,
    ],
  );

  const debouncedServiceLevelChange = useCallback(
    debounce((level: ServiceLevels) => {
      handleServiceLevelChange(level);
      if (refetchDrivers) {
        refetchDrivers('', vehicleTypeValue, level);
      }
    }, 300),
    [handleServiceLevelChange, vehicleTypeValue, refetchDrivers],
  );

  return (
    <div className="w-full flex flex-row flex-wrap justify-between gap-4">
      <div className={'flex-1 flex flex-col gap-4'}>
        <div className={'flex flex-row flex-wrap gap-4'}>
          <div className={'flex-1 flex flex-col gap-4'}>
            <label className="block text-gray-700 text-[20px] font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
              Транспорт:
              <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
            </label>

            {vehicleTypeOptions
              .filter((option) => option.value !== 'None')
              .map((typeOption) => (
                <div
                  key={typeOption.value}
                  className={cn(
                    'mb-2 p-3 rounded-lg border border-gray-200 transition-all duration-200',
                    vehicleTypeValue === typeOption.value ? FIELD_STYLES.card.active : '',
                    FIELD_STYLES.card.hover,
                  )}
                >
                  <Controller
                    name="vehicleType"
                    control={control}
                    render={({ field }) => (
                      <CheckboxInput
                        label={typeOption.label}
                        checked={field.value === typeOption.value}
                        onChange={() => debouncedVehicleTypeChange(typeOption.value)}
                      />
                    )}
                  />
                </div>
              ))}
          </div>

          <div className={'flex-1 flex flex-col gap-4'}>
            <label className="block text-gray-700 text-[20px] font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-700 to-blue-700">
              Класс:
              <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 to-transparent rounded-full mt-1"></div>
            </label>

            {serviceLevelOptions
              .filter((option) => option.value !== 'None')
              .map((levelOption) => {
                const isAvailable = vehicleTypeValue
                  ? isServiceLevelAvailable(levelOption.value, vehicleTypeValue)
                  : true;
                return (
                  <div
                    key={levelOption.value}
                    className={cn(
                      'mb-2 p-3 rounded-lg border border-gray-200 transition-all duration-200',
                      serviceLevelValue === levelOption.value && isAvailable
                        ? FIELD_STYLES.card.active
                        : '',
                      !isAvailable ? 'opacity-50' : FIELD_STYLES.card.hover,
                    )}
                  >
                    <Controller
                      name="serviceLevel"
                      control={control}
                      render={({ field }) => (
                        <CheckboxInput
                          label={levelOption.label}
                          checked={field.value === levelOption.value}
                          onChange={() => debouncedServiceLevelChange(levelOption.value)}
                          disabled={!isAvailable}
                          className={!isAvailable ? 'line-through' : ''}
                        />
                      )}
                    />
                    {!isAvailable && <p className="text-xs text-gray-500">Не обслуживается</p>}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      <div>
        <TariffCard
          selectedTariff={selectedTariff}
          selectedVehicleType={vehicleTypeValue}
          translatedVehicleType={translatedVehicleType}
          selectedServiceLevel={serviceLevelValue}
          fieldStyles={FIELD_STYLES}
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
  fieldStyles: any;
}

const TariffCard: React.FC<TariffCardProps> = ({
  selectedTariff,
  selectedVehicleType,
  translatedVehicleType,
  selectedServiceLevel,
  fieldStyles,
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
        'flex flex-col relative rounded-xl p-4 gap-4 cursor-pointer transition-all duration-200 transform',
        'bg-gradient-to-br from-cyan-50 to-white shadow-lg',
        'border-2',
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
              <p className="p-[9px] flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 border border-cyan-200 rounded-lg font-normal text-22px text-white">
                {translatedServiceLevel}
              </p>
              <p className="p-[10px] flex items-center justify-center border border-gray-200 rounded-lg font-normal text-base transition-all hover:border-cyan-200">
                {translatedVehicleType}
              </p>
              {seatInfo && (
                <p className="p-[10px] flex items-center justify-center border border-gray-200 rounded-lg font-normal text-base transition-all hover:border-cyan-200">
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
