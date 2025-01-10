import { Tariff, AdditionalService, ClientType } from '@prisma/client';

export interface CreateTariffData
  extends Omit<Tariff, 'uuid' | 'createdAt' | 'updatedAt' | 'clientTypes'> {
  clientTypes: ClientType[];
  tariffAdditionalServices: {
    serviceUuid: string;
    price: number;
    isAvailable: boolean;
  }[];
}

interface AdditionalServiceWithDetails extends Omit<AdditionalService, 'createdAt' | 'updatedAt'> {}

export interface DetailTariffData extends Tariff {
  tariffAdditionalServices: {
    service: AdditionalServiceWithDetails;
    price: number;
    isAvailable: boolean;
  }[];
}
