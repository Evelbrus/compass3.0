import { ServiceLevel } from '@prisma/client';

export type CreateServiceLevelData = Omit<
  ServiceLevel,
  'vehicles' | 'tariffs' | 'createdAt' | 'updatedAt'
>;

export type EditServiceLevelData = Omit<
  ServiceLevel,
  'uuid' | 'createdAt' | 'updatedAt' | 'vehicles' | 'tariffs'
>;
