import { openModal, setVehicleUuid } from '@shared/lib/effector';

export const handleVehicleDetail = (entity: 'vehicles', uuid: string) => {
  if (entity === 'vehicles' && uuid) {
    setVehicleUuid(uuid);
    openModal('vehicleDetail');
    console.log(`Открытие модального окна для автомобиля с UUID: ${uuid}`);
  } else {
    console.warn('Неверные параметры для handleVehicleDetail');
  }
};