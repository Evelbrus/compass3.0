// dto/orders/client-corp-order.dto.ts

import { OrderStatus, UserRole } from '@prisma/client';
import { Decimal } from 'decimal.js';

// DTO для создания заказа корпоративным клиентом
export interface CreateClientCorpOrderDTO {
  tariffUuid: string;
  departureTime: string | Date;
  departurePoint: string;
  arrivalPoint: string;
  intermediatePoints?: string[] | null;
  basePrice?: string | number | Decimal;
  selectedServices?: string[];
  description?: string | null;
  flightNumber?: string | null;
  waitingTimeMinutes?: number | null;
}

// DTO для получения заказов с параметрами запроса
export interface GetClientCorpOrdersRequestDTO {
  page?: number;
  per_page?: number;
  status?: OrderStatus | null;
  sort_by?: 'createdAt' | 'updatedAt' | 'finalPrice' | 'departureTime';
  sort_order?: 'asc' | 'desc';
}

// DTO для компании клиента
export interface CompanyProfileDTO {
  companyName: string | null;
  companyPhone: string | null;
  companyLogo: string | null;
}

// DTO для клиента в заказе
export interface OrderClientDTO {
  uuid: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  companyProfile: CompanyProfileDTO | null;
}

// DTO для водителя в заказе
export interface OrderDriverDTO {
  uuid: string | null;
  plateNumber: string | null;
  fullName: string | null;
  phone: string | null;
}

// DTO для тарифа в заказе
export interface OrderTariffDTO {
  uuid: string;
  name: string;
  vehicleType: string;
  serviceLevel: string;
}

// DTO для точки (адреса) в заказе
export interface OrderPointDTO {
  uuid: string;
  address: string;
  pricePerKm: Decimal | null;
}

// DTO для дополнительной услуги в тарифе
export interface TariffOnServiceDTO {
  uuid: string;
  price: Decimal;
  isAvailable: boolean;
  serviceUuid: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
}

// DTO для связи заказа с дополнительными услугами
export interface OrderTariffAdditionalServiceDTO {
  uuid: string;
  tariffOnServiceUuid: string;
  createdAt: Date;
  updatedAt: Date;
  tariffOnService: TariffOnServiceDTO;
}

// DTO для заказа в ответе
export interface ClientCorpOrderResponseDTO {
  uuid: string;
  status: OrderStatus;
  departureTime: Date;
  driverAcceptanceStatus: string | null;
  basePrice: Decimal;
  finalPrice: Decimal | null;
  clientBy: OrderClientDTO;
  assignedDriver: OrderDriverDTO | null;
  tariff: OrderTariffDTO;
  departurePoint: OrderPointDTO;
  arrivalPoint: OrderPointDTO;
  intermediatePoints: string[] | null;
  description: string | null;
  flightNumber: string | null;
  waitingTimeMinutes: number | null;
  orderTariffAdditionalServices: OrderTariffAdditionalServiceDTO[];
  createdAt: Date;
  updatedAt: Date;
}

// DTO для ответа со списком заказов
export interface ClientCorpOrdersListResponseDTO {
  status: string;
  page: number;
  per_page: number;
  total: number;
  statusesCount: {
    status: OrderStatus;
    _count: {
      status: number;
    };
  }[];
  orders: ClientCorpOrderResponseDTO[];
}
