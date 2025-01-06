import { Point } from '@prisma/client';

export type CreatePointData = Omit<Point, 'uuid' | 'createdAt' | 'updatedAt'>;
