import { Tariff, AdditionalService, VehicleType, ServiceLevels } from '@prisma/client';

export interface CreateTariffData
  extends Omit<Tariff, 'uuid' | 'createdAt' | 'updatedAt' | 'clientTypes'> {
  tariffAdditionalServices: {
    serviceUuid: string;
    price: number;
    isAvailable: boolean;
  }[];
}

interface AdditionalServiceWithDetails extends Omit<AdditionalService, 'createdAt' | 'updatedAt'> {}

export interface DetailTariffData extends Tariff {
  vehicleType: VehicleType;
  serviceLevel: ServiceLevels;
  tariffAdditionalServices: {
    uuid: string;
    service: AdditionalServiceWithDetails;
    serviceUuid: string;
    price: number;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
  }[];
}

export type EditTariffData = Omit<Tariff, 'uuid' | 'createdAt' | 'updatedAt' | 'clientTypes'> & {
  tariffIds?: string[];
  tariffAdditionalServices?: {
    serviceUuid: string;
    price: number;
    isAvailable: boolean;
  }[];
};
