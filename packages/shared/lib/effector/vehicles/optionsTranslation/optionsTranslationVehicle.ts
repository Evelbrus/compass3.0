import { Color, VehicleType, ServiceLevels } from '@prisma/client';

export const colorOptions = [
  { label: 'Другое', value: 'Other' as Color },
  { label: 'Белый', value: 'White' as Color },
  { label: 'Серебристый', value: 'Silver' as Color },
  { label: 'Золотой', value: 'Gold' as Color },
  { label: 'Чёрный', value: 'Black' as Color },
  { label: 'Серый', value: 'Grey' as Color },
  { label: 'Синий', value: 'Blue' as Color },
  { label: 'Розовый', value: 'Pink' as Color },
  { label: 'Красный', value: 'Red' as Color },
  { label: 'Оранжевый', value: 'Orange' as Color },
  { label: 'Коричневый', value: 'Brown' as Color },
  { label: 'Зелёный', value: 'Green' as Color },
  { label: 'Нет', value: 'None' as Color },
];

export const vehicleTypeOptions = [
  { label: 'Седан', value: 'Sedan' as VehicleType },
  { label: 'Минивэн', value: 'Minivan' as VehicleType },
  { label: 'Спринтер', value: 'Sprinter' as VehicleType },
  { label: 'Автобус', value: 'Bus' as VehicleType },
  { label: 'Нет', value: 'None' as VehicleType },
];

export const serviceLevelOptions = [
  { label: 'Базовый', value: 'Basic' as ServiceLevels },
  { label: 'Премиум', value: 'Premium' as ServiceLevels },
  { label: 'VIP', value: 'Vip' as ServiceLevels },
  { label: 'Нет', value: 'None' as ServiceLevels },
];
