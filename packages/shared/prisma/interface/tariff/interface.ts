import { Tariff, ServiceLevel, TariffOnService, AdditionalService } from '@prisma/client';

export interface CreateTariffData extends Omit<Tariff, 'uuid' | 'createdAt' | 'updatedAt'> {
  tariffOnServiceLevels: {
    serviceUuid: string;
  }[];
  tariffAdditionalServices: {
    serviceUuid: string;
  }[];
}

interface ServiceLevelWithDetails extends Omit<ServiceLevel, 'createdAt' | 'updatedAt'> {}

interface AdditionalServiceWithDetails extends Omit<AdditionalService, 'createdAt' | 'updatedAt'> {}

interface TariffOnServiceWithDetails extends Omit<TariffOnService, 'createdAt' | 'updatedAt'> {
  service: {
    name: string;
    price: number;
  };
}

export interface DetailTariffData extends Tariff {
  tariffOnServiceLevels: {
    service: ServiceLevelWithDetails;
  }[];
  tariffAdditionalServices: {
    service: AdditionalServiceWithDetails;
  }[];
}
