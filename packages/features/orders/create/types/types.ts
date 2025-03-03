import {
  OrderStatus,
  Point,
  Tariff,
  TariffOnService,
  User,
  Vehicle,
  VehicleDriver,
} from '@prisma/client';

export type Client = Pick<User, 'uuid' | 'fullName' | 'email' | 'phone' | 'role'>;

export type PointWithoutTimestamps = Pick<
  Point,
  'uuid' | 'address' | 'pricePerKm' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
>;

export type Driver = Pick<
  User,
  'uuid' | 'fullName' | 'email' | 'phone' | 'role' | 'profilePhotoPath' | 'lastActive'
> & {
  vehicleDriver?: VehicleDriver & {
    vehicle: Pick<
      Vehicle,
      'uuid' | 'vehicleType' | 'serviceLevels' | 'plateNumber' | 'isAvailable'
    >;
  };
};

export type OrderData = {
  uuid: string;
  createdBy: Client;
  tariff: Tariff & { tariffAdditionalServices: TariffOnService[] };
  departurePoint: PointWithoutTimestamps | null;
  arrivalPoint: PointWithoutTimestamps | null;
  assignedDriver?: Driver;
  departureTime: string;
  selectedServices: TariffOnService[];
  intermediatePoints: Array<
    PointWithoutTimestamps & {
      pricePerKm: number;
    }
  >;
  description: string | null;
  flightNumber: string | null;
  status: OrderStatus;
  basePrice: number;
  waitingTimeMinutes: number;
};
