import React, { useCallback, useEffect } from 'react';
import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { useFormContext, Controller } from 'react-hook-form';
import { ServiceLevels, VehicleType } from '@prisma/client';
import { CheckboxInput, TextInput } from '@shared/components/ui/inputs';
import { OrderData } from '@features/orders/create/OrderCreate.logic';
import { useUnit } from 'effector-react';
import {
  $selectedVehicleType,
  $selectedServiceLevel,
} from '@shared/lib/effector/orders/stateStore';

//Определяем типы VehicleType и ServiceLevels без "None"
const vehicleTypes = Object.values(VehicleType).filter((vt) => vt !== 'None') as VehicleType[];
const serviceLevels = Object.values(ServiceLevels).filter((sl) => sl !== 'None') as ServiceLevels[];

interface FilterTariffProps {
  tariffs: ExtendedTariff[];
  selectedTariff: ExtendedTariff | null;
  isLoadingTariff: boolean;
  handleVehicleTypeChange: (value: VehicleType | null) => void;
  handleServiceLevelChange: (value: ServiceLevels | null) => void;
  handleTariffSelect: (tariffUuid: string) => void;
}

const FilterTariff: React.FC<FilterTariffProps> = ({
  tariffs,
  selectedTariff,
  isLoadingTariff,
  handleVehicleTypeChange,
  handleServiceLevelChange,
  handleTariffSelect,
}) => {
  const { formState, setValue, control, watch } = useFormContext<OrderData>();
  const [combinedErrorMessage, setCombinedErrorMessage] = React.useState('');

  //Получаем значения из effector store
  const selectedVehicleType = useUnit($selectedVehicleType);
  const selectedServiceLevel = useUnit($selectedServiceLevel);

  useEffect(() => {
    setCombinedErrorMessage(
      (formState.errors.tariff?.vehicleType?.message || '') +
        ' ' +
        (formState.errors?.tariff?.serviceLevel?.message || '') +
        ' ' +
        (formState.errors.tariffUuid?.message || ''),
    );
  }, [
    formState.errors?.tariff?.vehicleType?.message,
    formState.errors?.tariff?.serviceLevel?.message,
    formState.errors.tariffUuid?.message,
  ]);

  const getAvailableServiceLevels = useCallback(() => {
    if (!selectedVehicleType) {
      return serviceLevels; //Использовать отфильтрованный serviceLevels
    }
    return tariffs
      .filter((tariff) => tariff.vehicleType === selectedVehicleType)
      .map((tariff) => tariff.serviceLevel);
  }, [selectedVehicleType, tariffs]);

  const getTariffsForVehicleType = useCallback(
    (vehicleType: VehicleType) => {
      return tariffs.filter((tariff) => tariff.vehicleType === vehicleType);
    },
    [tariffs],
  );

  const handleVehicleTypeChangeWithReset = useCallback(
    (value: VehicleType | null) => {
      handleVehicleTypeChange(value); //Сообщаем об изменении родительскому компоненту
      setValue('tariff.serviceLevel', null);
      setValue('tariffUuid', '');
    },
    [handleVehicleTypeChange, setValue],
  );

  const handleServiceLevelChangeWithReset = useCallback(
    (value: ServiceLevels | null) => {
      handleServiceLevelChange(value); //Сообщаем об изменении родительскому компоненту
      setValue('tariffUuid', '');
    },
    [handleServiceLevelChange, setValue],
  );

  useEffect(() => {
    if (selectedVehicleType && selectedServiceLevel) {
      const foundTariff = tariffs.find(
        (tariff) =>
          tariff.vehicleType === selectedVehicleType &&
          tariff.serviceLevel === selectedServiceLevel,
      );

      if (foundTariff) {
        setValue('tariffUuid', foundTariff.uuid);
        handleTariffSelect(foundTariff.uuid);
      } else {
        setValue('tariffUuid', '');
      }
    }
  }, [selectedVehicleType, selectedServiceLevel, tariffs, setValue, handleTariffSelect]);

  return (
    <div className="w-full h-fit bg-white flex flex-col rounded-md">
      <div className="flex flex-row w-full">
        <div className="w-1/3">
          <p className="bg-[#E4E4E4] p-7 text-5 leading-5 text-[#989898] font-light rounded-tl-md">
            Vehicle Type
          </p>
          <Controller
            name="tariff.vehicleType"
            control={control}
            rules={{ required: 'Выберите тип транспортного средства' }}
            render={({ field }) => (
              <>
                {vehicleTypes.map(
                  (
                    vt, //Используем отфильтрованный vehicleTypes
                  ) => (
                    <div key={vt} className="px-7 py-4 text-4 leading-4 text-[#989898] font-light">
                      <CheckboxInput
                        label={vt}
                        checked={selectedVehicleType === vt} //Используем effector store для checked
                        onChange={() => {
                          const newValue = selectedVehicleType === vt ? null : vt;
                          field.onChange(newValue);
                          handleVehicleTypeChangeWithReset(newValue);
                        }}
                        className="w-full items-center justify-center"
                      />
                    </div>
                  ),
                )}
              </>
            )}
          />
        </div>

        <div className="w-1/3">
          <p className="bg-[#E4E4E4] p-7 text-5 leading-5 text-[#989898] font-light">
            Service Level
          </p>
          <Controller
            name="tariff.serviceLevel"
            control={control}
            rules={{ required: 'Выберите уровень обслуживания' }}
            render={({ field }) => (
              <>
                {serviceLevels.map((sl) => {
                  //Используем отфильтрованный serviceLevels
                  const isServiceLevelAvailable = getAvailableServiceLevels().includes(sl);
                  return (
                    <div
                      key={sl}
                      className={`px-7 py-4 text-4 leading-4 text-[#989898] font-light ${
                        isServiceLevelAvailable ? '' : 'opacity-50 pointer-events-none'
                      }`}
                    >
                      <CheckboxInput
                        label={sl}
                        checked={selectedServiceLevel === sl} //Используем effector store для checked
                        onChange={() => {
                          const newValue = selectedServiceLevel === sl ? null : sl;
                          field.onChange(newValue);
                          handleServiceLevelChangeWithReset(newValue);
                        }}
                        className="w-full"
                        disabled={!isServiceLevelAvailable}
                      />
                    </div>
                  );
                })}
              </>
            )}
          />
        </div>

        <div className="w-1/3">
          <p className="bg-[#E4E4E4] p-7 text-5 leading-5 text-[#989898] font-light rounded-tr-md">
            Tariff
          </p>
          <Controller
            name="tariffUuid"
            control={control}
            render={({ field }) => {
              const tariffsForVehicleType = getTariffsForVehicleType(selectedVehicleType);

              return (
                <>
                  {selectedVehicleType && tariffs.length && !isLoadingTariff ? (
                    <div>
                      {serviceLevels.map((serviceLevel) => {
                        //Используем отфильтрованный serviceLevels
                        const tariff = tariffsForVehicleType.find(
                          (t) => t.serviceLevel === serviceLevel,
                        );

                        return (
                          <div key={serviceLevel} className="px-7 py-4">
                            {tariff ? (
                              <label
                                htmlFor={tariff.uuid}
                                className="ml-1 w-full flex items-center"
                              >
                                <input
                                  type="radio"
                                  id={tariff.uuid}
                                  name="tariff"
                                  value={tariff.uuid}
                                  checked={field.value === tariff.uuid}
                                  onChange={() => {
                                    field.onChange(tariff.uuid);
                                    handleTariffSelect(tariff.uuid);
                                  }}
                                  className="hidden"
                                />
                                <TextInput
                                  readOnly
                                  value={`${tariff.price}c`}
                                  onChange={() => {}}
                                  className="text-6 leading-6 font-extrabold font-helvetica-neue"
                                  classNameBg="bg-transparent"
                                  classNameBorderRadius="border-none rounded-md"
                                  classNamePadding="p-0"
                                  classNamePlaceholder="text-5 leading-5"
                                />
                              </label>
                            ) : (
                              <div className="text-gray-500">Тариф не существует</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                  {formState.errors.tariffUuid && (
                    <span className="text-red-500">{formState.errors.tariffUuid.message}</span>
                  )}
                </>
              );
            }}
          />
        </div>
      </div>

      {combinedErrorMessage && <div className="text-red-500 p-4">{combinedErrorMessage}</div>}

      <div className="w-full p-4 border-t rounded-b-md bg-white flex">
        <div className="w-full flex flex-col gap-4">
          <h2 className="text-5 leading-5 font-extrabold rounded-tl-md">Информация о тарифе</h2>
          <div className="w-full flex flex-row gap-2">
            <div className="w-full overflow-x-auto border rounded-md p-4">
              <table className="w-full table-auto">
                <tbody>
                  <tr>
                    <td className="w-1/2 font-medium px-2 py-1 border-b">Цена:</td>
                    <td className="w-1/5 px-2 py-1 border-b">
                      <span>{selectedTariff?.price ?? ''}c</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-б">Доп. цена за точку:</td>
                    <td className="px-2 py-1 border-б">
                      <span>{selectedTariff?.additionalPointPrice ?? ''}c</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-б">
                      Бесплатное время ожидания в Бишкеке:
                    </td>
                    <td className="px-2 py-1 border-б">
                      <span>{selectedTariff?.freeWaitTimeBishkek ?? ''} мин</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-б">
                      Цена за минуту ожидания после бесплатного периода в Бишкеке:
                    </td>
                    <td className="px-2 py-1 border-б">
                      <span>{selectedTariff?.pricePerMinuteAfterBishkek ?? ''}c</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-б">
                      Бесплатное время ожидания в аэропорту:
                    </td>
                    <td className="px-2 py-1 border-б">
                      <span>{selectedTariff?.freeWaitTimeAirport ?? ''} мин</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-б">
                      Цена за минуту ожидания после бесплатного периода в аэропорту:
                    </td>
                    <td className="px-2 py-1 border-б">
                      <span>{selectedTariff?.pricePerMinuteAfterAirport ?? ''}c</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-б">Уровень сервиса:</td>
                    <td className="px-2 py-1 border-б">{selectedTariff?.serviceLevel ?? ''}</td>
                  </tr>
                  <tr>
                    <td className="font-medium px-2 py-1 border-б">Тип машины:</td>
                    <td className="px-2 py-1 border-б">{selectedTariff?.vehicleType ?? ''}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="w-full flex flex-col gap-2">
              <h2 className="text-5 leading-5 font-extrabолд rounded-тл-md">Описание тарифа</h2>
              <div className="h-full overflow-auto rounded-md bg-white п-2 italic">
                {selectedTariff?.description ?? ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterTariff;
