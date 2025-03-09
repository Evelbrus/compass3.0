// app/src/dto/orders/order.dto.ts
import { Decimal } from 'decimal.js';
import { Action, DriverAcceptanceStatus, Gender, OrderStatus, UserRole } from '@prisma/client';

export interface CreateOrderDTO {
  createdBy: string;
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

export interface OrderTariffAdditionalServiceDTO {
  serviceUuid: string;
  name: string;
  price: number | string | Decimal;
}

export interface OrderResponseDTO {
  createdBy: string;
  assignedDriverId: string | null;
  departurePoint: string;
  arrivalPoint: string;
  intermediatePoints: string[];
  tariff: any; // Можно детализировать при необходимости
  description: string | null;
  status: OrderStatus;
  flightNumber: string | null;
  waitingTimeMinutes: number;
  departureTime: Date;
  createdAt: Date;
  updatedAt: Date;
  orderTariffAdditionalServices: OrderTariffAdditionalServiceDTO[];
  basePrice: number | string | Decimal;
}

export interface OrdersListResponseDTO {
  page: number;
  per_page: number;
  total: number;
  totalAllOrders: number;
  statusesCount: Array<{
    status: OrderStatus;
    _count: {
      status: number;
    };
  }>;
  orders: OrderResponseDTO[];
}

export interface ProcessNotificationDTO {
  userId: string;
  orderId: string;
  action: Action;
  templateKey: string;
  createdById: string;
  driverById?: string;
}
