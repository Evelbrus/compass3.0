import { Order, User, Tariff, Point, OrderStatus } from '@prisma/client';
import Decimal from 'decimal.js';

//Расширенный тариф с дополнительными услугами и уровнями обслуживания
export interface ExtendedTariff extends Tariff {
  tariffAdditionalServices: { price: Decimal }[];
  tariffOnServiceLevels: { service: { price: Decimal } }[];
}

//Тип данных для создания заказа
export interface CreateOrderData
  extends Omit<Order, 'uuid' | 'finalPrice' | 'createdAt' | 'updatedAt'> {
  createdBy: User;
  tariff: ExtendedTariff;
  departurePoint: Point;
  arrivalPoint: Point;
}

//Тип данных для редактирования заказа
export interface EditOrderData extends Omit<Order, 'finalPrice' | 'createdAt' | 'updatedAt'> {
  createdBy: User;
  tariff: ExtendedTariff;
  departurePoint: Point;
  arrivalPoint: Point;
}

//Тип данных для детализированного представления заказа
export interface DetailOrderData extends Order {
  createdBy: User;
  tariff: ExtendedTariff;
  departurePoint: Point;
  arrivalPoint: Point;
}
