import { AdditionalService } from '@prisma/client';

export type CreateAdditionalServiceData = Omit<
  AdditionalService,
  'uuid' | 'createdAt' | 'updatedAt' | 'TariffOnService'
>;

export type EditAdditionalServiceData = Omit<
  AdditionalService,
  'uuid' | 'createdAt' | 'updatedAt' | 'TariffOnService'
>;
