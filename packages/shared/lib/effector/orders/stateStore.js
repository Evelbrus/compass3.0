import { createStore, createEvent } from 'effector';
//События для изменения выбранных значений
export const setSelectedVehicleType = createEvent();
export const setSelectedServiceLevel = createEvent();
//Событие для установки флага инициализации из пропсов (общего)
export const setValuesFromProps = createEvent();
//Хранилище для выбранного типа ТС, по умолчанию – null
export const $selectedVehicleType = createStore(null, {
    skipVoid: false,
}).on(setSelectedVehicleType, (_, vehicleType) => {
    console.log('Effector: setSelectedVehicleType', vehicleType);
    return vehicleType;
});
//Хранилище для выбранного уровня сервиса, по умолчанию – null
export const $selectedServiceLevel = createStore(null, {
    skipVoid: false,
}).on(setSelectedServiceLevel, (_, serviceLevel) => {
    console.log('Effector: setSelectedServiceLevel', serviceLevel);
    return serviceLevel;
});
//Хранилище для отслеживания, были ли значения инициализированы из пропсов
export const $areValuesFromProps = createStore(false).on(setValuesFromProps, (_, isFromProps) => {
    console.log('Effector: setValuesFromProps', isFromProps);
    return isFromProps;
});
