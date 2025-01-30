import React, { useState, useEffect, useCallback } from 'react';
import { CreateOrderData, ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { useFormContext } from 'react-hook-form';
import { Point, ServiceLevels, VehicleType } from '@prisma/client';
import { RadioInput, TextInput } from '@shared/components/ui/inputs';

interface FilterTariffProps {
  tariffs: ExtendedTariff[];
  selectedAdditionalServices: string[];
  handleAdditionalServiceChangeCallback: (
    e: React.ChangeEvent<HTMLInputElement>,
    serviceUuid: string,
  ) => void;
  handleVehicleTypeChange: (value: VehicleType) => void;
  selectedVehicleType: VehicleType | null;
  vehicleTypes: VehicleType[];
  handleServiceLevelChange: (value: ServiceLevels) => void;
  selectedServiceLevel: ServiceLevels | null;
  serviceLevels: ServiceLevels[];
  handleWaitingTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  waitingTimeMinutes: number;
  waitingInfo: {
    freeWaitTime: number;
    pricePerMinute: number;
    isAirport: boolean;
  } | null;
  selectedTariff: ExtendedTariff | null;
  getAvailablePoints: (exclude: string[]) => Point[];
  isLoadingTariff: boolean;
}

const FilterTariff: React.FC<FilterTariffProps> = ({
  tariffs,
  handleVehicleTypeChange,
  selectedVehicleType,
  vehicleTypes,
  handleServiceLevelChange,
  selectedServiceLevel,
  serviceLevels,
  handleWaitingTimeChange,
  waitingTimeMinutes,
  waitingInfo,
  selectedTariff,
  isLoadingTariff,
}) => {
  const { formState } = useFormContext<CreateOrderData>();
  const [localWaitingTime, setLocalWaitingTime] = useState<number>(waitingTimeMinutes);
  const [isWaitingTimeEnabled, setIsWaitingTimeEnabled] = useState(false);

  useEffect(() => {
    if (waitingInfo) {
      setLocalWaitingTime(waitingInfo.freeWaitTime);
      setIsWaitingTimeEnabled(true);
    } else {
      setLocalWaitingTime(0);
      setIsWaitingTimeEnabled(false);
    }
  }, [waitingInfo]);

  useEffect(() => {
    if (isWaitingTimeEnabled) {
      handleWaitingTimeChange({
        target: { value: localWaitingTime.toString() },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [localWaitingTime, handleWaitingTimeChange, isWaitingTimeEnabled]);

  const handleVehicleTypeRadioChange = (value: VehicleType) => {
    handleVehicleTypeChange(value);
  };

  const handleServiceLevelRadioChange = (value: ServiceLevels) => {
    handleServiceLevelChange(value);
  };

  const getTariffsForVehicleType = (vehicleType: VehicleType) => {
    return tariffs.filter((tariff) => tariff.vehicleType === vehicleType);
  };
  const getAvailableServiceLevels = () => {
    if (!selectedVehicleType) {
      return [];
    }
    const availableTariffs = getTariffsForVehicleType(selectedVehicleType);
    return Array.from(new Set(availableTariffs.map((tariff) => tariff.serviceLevel)));
  };
  const filteredVehicleTypes = vehicleTypes.filter((vt) => vt !== 'None');
  const filteredServiceLevels = serviceLevels.filter((sl) => sl !== 'None');

  //Автоматический выбор первого уровня обслуживания
  useEffect(() => {
    if (selectedVehicleType && tariffs && !selectedServiceLevel) {
      const availableServiceLevels = getAvailableServiceLevels();
      if (availableServiceLevels.length > 0) {
        const firstServiceLevel = availableServiceLevels[0];
        handleServiceLevelChange(firstServiceLevel);
      }
    }
  }, [selectedVehicleType, tariffs, handleServiceLevelChange, selectedServiceLevel]);

  return (
    <div className="w-full h-fit bg-white flex flex-col rounded-md">
      <div className="flex flex-row w-full">
        <div className="w-1/3">
          <p className="bg-[#E4E4E4] p-7 text-5 leading-5 text-[#989898] font-light rounded-tl-md">
            Vehicle Type
          </p>
          {filteredVehicleTypes.map((vt) => (
            <div key={vt} className="px-7 py-4 text-4 leading-4 text-[#989898] font-light">
              <RadioInput
                label={vt}
                name="vehicleType"
                checked={selectedVehicleType === vt}
                onChange={() => handleVehicleTypeRadioChange(vt)}
                className="w-full items-center justify-center"
              />
            </div>
          ))}
        </div>
        <div className="w-1/3">
          <p className="bg-[#E4E4E4] p-7 text-5 leading-5 text-[#989898] font-light">
            Service Level
          </p>
          {filteredServiceLevels.map((sl) => {
            const isServiceLevelAvailable = getAvailableServiceLevels().includes(sl);
            return (
              <div
                key={sl}
                className={`px-7 py-4 text-4 leading-4 text-[#989898] font-light ${isServiceLevelAvailable ? '' : 'opacity-50 pointer-events-none'}`}
              >
                <RadioInput
                  label={sl}
                  name="serviceLevel"
                  checked={selectedServiceLevel === sl}
                  onChange={() => handleServiceLevelRadioChange(sl)}
                  className="w-full"
                  disabled={!isServiceLevelAvailable}
                />
              </div>
            );
          })}
        </div>
        <div className="w-1/3">
          <p className="bg-[#E4E4E4] p-7 text-5 leading-5 text-[#989898] font-light rounded-tr-md">
            Tariff
          </p>
          {selectedVehicleType && tariffs && !isLoadingTariff && (
            <div>
              {filteredServiceLevels.map((sl) => (
                <div key={sl}>
                  {getTariffsForVehicleType(selectedVehicleType).some(
                    (tariff) => tariff.serviceLevel === sl,
                  ) ? (
                    getTariffsForVehicleType(selectedVehicleType)
                      .filter((tariff) => tariff.serviceLevel === sl)
                      .map((tariff) => (
                        <div key={tariff.uuid} className="px-7 py-4">
                          <label htmlFor={tariff.uuid} className="ml-1 w-full flex items-center">
                            <TextInput
                              readOnly
                              value={`${tariff.price}c`}
                              onChange={() => {}}
                              className={'text-6 leading-6 font-extrabold font-helvetica-neue'}
                              classNameBg={'bg-transparent'}
                              classNameBorderRadius={'border-none rounded-md'}
                              classNamePadding={'p-0'}
                              classNamePlaceholder={'text-5 leading-5'}
                            />
                          </label>
                        </div>
                      ))
                  ) : (
                    <div className="px-7 py-4 text-4 leading-4 text-[#989898] font-light italic">
                      Нет тарифов для данного уровня
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {formState.errors.tariffUuid && (
            <span className="text-red-500">{formState.errors.tariffUuid.message}</span>
          )}
        </div>
      </div>
      <div className="w-full p-4 mt-4 border-t rounded-b-md bg-white flex">
        <div className="w-full flex flex-col gap-4">
          <h2 className="text-5 leading-5 font-extrabold rounded-tl-md">Информация о тарифе</h2>
          <div className={'w-full flex flex-row gap-2'}>
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto">
                <tbody>
                  <tr>
                    <td className="w-1/2 font-medium px-2 py-1 border-b">Цена:</td>
                    <td className="w-1/5 px-2 py-1 border-b">
                      <span>{selectedTariff?.price ? `${selectedTariff.price}c` : ''}</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-b">Доп. цена за точку:</td>
                    <td className="px-2 py-1 border-b">
                      <span>
                        {selectedTariff?.additionalPointPrice
                          ? `${selectedTariff.additionalPointPrice}c`
                          : ''}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-b">
                      Бесплатное время ожидания в Бишкеке:
                    </td>
                    <td className="px-2 py-1 border-b">
                      <span>
                        {selectedTariff?.freeWaitTimeBishkek
                          ? `${selectedTariff.freeWaitTimeBishkek} мин`
                          : ''}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-b">
                      Цена за минуту ожидания после беспл. в Бишкеке:
                    </td>
                    <td className="px-2 py-1 border-b">
                      <span>
                        {selectedTariff?.pricePerMinuteAfterBishkek
                          ? `${selectedTariff.pricePerMinuteAfterBishkek}c`
                          : ''}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-b">
                      Бесплатное время ожидания в аэропорту:
                    </td>
                    <td className="px-2 py-1 border-b">
                      <span>
                        {selectedTariff?.freeWaitTimeAirport
                          ? `${selectedTariff.freeWaitTimeAirport} мин`
                          : ''}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-b">
                      Цена за минуту ожидания после беспл. в аэропорту:
                    </td>
                    <td className="px-2 py-1 border-b">
                      <span>
                        {selectedTariff?.pricePerMinuteAfterAirport
                          ? `${selectedTariff.pricePerMinuteAfterAirport}c`
                          : ''}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-b">Уровень сервиса:</td>
                    <td className="px-2 py-1 border-b">{selectedTariff?.serviceLevel || ''}</td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-b">Тип машины:</td>
                    <td className="px-2 py-1 border-b">{selectedTariff?.vehicleType || ''}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="w-full flex flex-col gap-2">
              <span className="font-medium text-center">Описание:</span>
              <div className="h-full overflow-auto border-l bg-white p-2 italic">
                {selectedTariff?.description || ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterTariff;
