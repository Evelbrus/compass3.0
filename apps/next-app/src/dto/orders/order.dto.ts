// app/src/dto/orders/order.dto.ts
import { Decimal } from 'decimal.js';
import { DriverAcceptanceStatus, OrderStatus, ServiceLevels, VehicleType } from '@prisma/client';

export interface CreateOrderDTO {
  clientBy: string;
  tariffUuid: string;
  departureTime: string | Date;
  departurePoint: string;
  arrivalPoint: string;
  intermediatePoints?: string[];
  basePrice?: number | string | Decimal;
  selectedServices?: string[];
  assignedDriverId?: string;
  description?: string;
  flightNumber?: string;
  waitingTimeMinutes?: number;
  fullName?: string;
  phone?: string;
  status?: OrderStatus;
}

export interface GetOrdersRequestDTO {
  page: number;
  per_page: number;
  status: OrderStatus | null;
  sort_by: 'createdAt' | 'updatedAt' | 'finalPrice' | 'departureTime';
  sort_order: 'asc' | 'desc';
}

export interface OrderResponseDTO {
  clientBy: {
    fullName: string;
    phone: string;
    role: string;
    companyProfile?: {
      companyName: string;
      phone: string;
      logoImagePath?: string | null;
    } | undefined;
  };
  assignedDriver?: { fullname: string; phone: string } | undefined;
  plateNumber?: number | undefined;
  tariff: { name: string; vehicleType: VehicleType; serviceLevel: ServiceLevels };
  driverAcceptanceStatus?: DriverAcceptanceStatus | null;
  departurePoint: { address: string };
  arrivalPoint: { address: string };
  status: string;
  createdAt: Date;
  updatedAt: Date;
  basePrice: number;
  departureTime: Date;
}
