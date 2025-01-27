import { Order, User, Tariff, Point } from '@prisma/client';

export interface TariffAdditionalService {
  uuid: string;
  name: string;
  price: number;
  serviceUuid: string;
}

export interface ExtendedTariff extends Tariff {
  tariffAdditionalServices: TariffAdditionalService[];
}

export interface CreateOrderData
  extends Omit<
    Order,
    | 'uuid'
    | 'finalPrice'
    | 'createdAt'
    | 'updatedAt'
    | 'tariff'
    | 'createdById'
    | 'basePrice'
    | 'departurePointId'
    | 'assignedDriverId'
    | 'arrivalPointId'
    | 'status'
    | 'departureTime'
    | 'intermediatePoints'
  > {
  createdBy: string;
  tariffUuid: string;
  departurePoint: string;
  arrivalPoint: string;
  assignedDriverId?: string | null;
  assignedDriverUserId?: string | null;
  intermediatePoints?: string[];
  selectedServices?: string[];
  basePrice?: number;
  departureTime?: string;
}

//Тип данных для редактирования заказа
export interface EditOrderData
  extends Omit<
    Order,
    | 'uuid'
    | 'finalPrice'
    | 'createdAt'
    | 'updatedAt'
    | 'tariff'
    | 'createdById'
    | 'basePrice'
    | 'departurePointId'
    | 'assignedDriverId'
    | 'arrivalPointId'
    | 'status'
    | 'departureTime'
    | 'intermediatePoints'
  > {
  createdBy: string;
  tariffUuid: string;
  departurePoint: string;
  arrivalPoint: string;
  assignedDriverId?: string | null;
  assignedDriverUserId?: string | null;
  intermediatePoints?: string[];
  selectedServices?: string[];
  basePrice?: number;
  departureTime?: string;
}

//Тип данных для детализированного представления заказа
export interface DetailOrderData extends Order {
  createdBy: User;
  tariff: ExtendedTariff;
  departurePoint: Point;
  arrivalPoint: Point;
}
