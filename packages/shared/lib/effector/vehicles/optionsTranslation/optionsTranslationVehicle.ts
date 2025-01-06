import { Color, VehicleType } from '@prisma/client';

export const colorOptions = [
  { value: Color.Other, label: 'Другое' },
  { value: Color.White, label: 'Белый' },
  { value: Color.Silver, label: 'Серебристый' },
  { value: Color.Gold, label: 'Золотой' },
  { value: Color.Black, label: 'Чёрный' },
  { value: Color.Grey, label: 'Серый' },
  { value: Color.Blue, label: 'Синий' },
  { value: Color.Pink, label: 'Розовый' },
  { value: Color.Red, label: 'Красный' },
  { value: Color.Orange, label: 'Оранжевый' },
  { value: Color.Brown, label: 'Коричневый' },
  { value: Color.Green, label: 'Зелёный' },
];

export const vehicleTypeOptions = [
  { value: VehicleType.Coupe, label: 'Купе' },
  { value: VehicleType.Minivan, label: 'Минивэн' },
  { value: VehicleType.Sedan, label: 'Седан' },
  { value: VehicleType.SUV, label: 'Внедорожник' },
  { value: VehicleType.Hatchback, label: 'Хэтчбек' },
  { value: VehicleType.Wagon, label: 'Универсал' },
  { value: VehicleType.Van, label: 'Фургон' },
  { value: VehicleType.Convertible, label: 'Кабриолет' },
  { value: VehicleType.Pickup, label: 'Пикап' },
  { value: VehicleType.Electric, label: 'Электрический' },
  { value: VehicleType.Hybrid, label: 'Гибрид' },
];
