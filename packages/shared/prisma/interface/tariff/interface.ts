import { Tariff, AdditionalService } from '@prisma/client';

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
  tariffAdditionalServices: {
    service: AdditionalServiceWithDetails;
    price: number;
    isAvailable: boolean;
  }[];
}
