import { OrderStatus, DriverAcceptanceStatus, User, Tariff, Point, Vehicle } from '@prisma/client';
import { Decimal } from 'decimal.js';

export interface OrderDetail {
  uuid: string;
  departurePoint: Point;
  arrivalPoint: Point;
  clientBy: User;
  tariff: Tariff;
  departureTime: Date;
  description: string | null;
  additionalServices?: { uuid: string; name: string; price: number }[];
  driverAcceptanceStatus: DriverAcceptanceStatus | null;
  status: OrderStatus;
  assignedDriverId: string | null;
  assignedDriver?: User & { vehicle?: Vehicle; rating?: number; tripsCount?: number };
  basePrice: Decimal;
  intermediatePoints: string[];
  distanceKm?: number;
  estimatedDurationMinutes?: number;
  estimatedArrivalTime?: Date | string;
  waitingTimeMinutes: number;
}