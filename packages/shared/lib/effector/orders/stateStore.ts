import { createStore, createEvent } from 'effector';
import { VehicleType, ServiceLevels } from '@prisma/client';

//События для изменения выбранных значений
export const setSelectedVehicleType = createEvent<VehicleType | null>();
export const setSelectedServiceLevel = createEvent<ServiceLevels | null>();
//Событие для установки флага инициализации из пропсов (общего)
export const setValuesFromProps = createEvent<boolean>();

//Хранилище для выбранного типа ТС, по умолчанию – null
export const $selectedVehicleType = createStore<VehicleType | null>(null, {
  skipVoid: false,
}).on(setSelectedVehicleType, (_, vehicleType) => {
  return vehicleType;
});

//Хранилище для выбранного уровня сервиса, по умолчанию – null
export const $selectedServiceLevel = createStore<ServiceLevels | null>(null, {
  skipVoid: false,
}).on(setSelectedServiceLevel, (_, serviceLevel) => {
  return serviceLevel;
});

//Хранилище для отслеживания, были ли значения инициализированы из пропсов
export const $areValuesFromProps = createStore<boolean>(false).on(
  setValuesFromProps,
  (_, isFromProps) => {
    return isFromProps;
  },
);
