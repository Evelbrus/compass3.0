//useCreateClientCorpOrderLogic.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
const useCreateClientCorpOrderLogic = (tariffs, initialServiceLevel, initialVehicleType) => {
    //Инициализируем useForm и получаем полный объект методов
    const formMethods = useForm({
        mode: 'onBlur',
        defaultValues: {
            serviceLevel: initialServiceLevel || 'Basic',
            vehicleType: initialVehicleType || 'Sedan',
            flightNumber: '',
            description: '',
        },
    });
    const { watch, setValue, getValues } = formMethods;
    //Получаем текущие значения полей формы
    const selectedServiceLevel = watch('serviceLevel');
    const selectedVehicleType = watch('vehicleType');
    //Состояние для выбранного тарифа
    const [selectedTariff, setSelectedTariff] = useState(null);
    //Используем ref для хранения ранее выбранных уровней обслуживания для разных типов авто
    const serviceLevelMapRef = useRef({});
    //Подбор тарифа по выбранным параметрам
    useEffect(() => {
        if (selectedServiceLevel && selectedVehicleType) {
            const matchingTariff = tariffs.find((tariff) => tariff.serviceLevel === selectedServiceLevel &&
                tariff.vehicleType === selectedVehicleType);
            setSelectedTariff(matchingTariff || null);
        }
        else {
            setSelectedTariff(null);
        }
    }, [selectedServiceLevel, selectedVehicleType, tariffs]);
    //Обработчик изменения уровня обслуживания
    const handleServiceLevelChange = useCallback((level) => {
        setValue('serviceLevel', level);
        const currentVehicleType = getValues('vehicleType');
        if (currentVehicleType) {
            serviceLevelMapRef.current[currentVehicleType] = level;
        }
    }, [setValue, getValues]);
    //Обработчик изменения типа авто с сохранением и восстановлением уровня обслуживания
    const handleVehicleTypeChange = useCallback((newType) => {
        //Сохраняем текущий уровень обслуживания для предыдущего типа авто
        const currentVehicleType = getValues('vehicleType');
        const currentServiceLevel = getValues('serviceLevel');
        if (currentVehicleType && currentServiceLevel) {
            serviceLevelMapRef.current[currentVehicleType] = currentServiceLevel;
        }
        //Устанавливаем новый тип авто
        setValue('vehicleType', newType);
        //Восстанавливаем уровень обслуживания, если он уже был выбран для нового типа, иначе сбрасываем
        const savedServiceLevel = serviceLevelMapRef.current[newType];
        setValue('serviceLevel', savedServiceLevel ?? undefined);
    }, [setValue, getValues]);
    return {
        selectedServiceLevel,
        selectedVehicleType,
        selectedTariff,
        handleServiceLevelChange,
        handleVehicleTypeChange,
        formMethods,
    };
};
export default useCreateClientCorpOrderLogic;
