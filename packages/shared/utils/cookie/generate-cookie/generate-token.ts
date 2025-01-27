import { UserRole } from '@prisma/client';

export interface JWTPayload {
  uuid: string;
  email?: string;
  role?: UserRole;
  iat?: number;
  exp?: number;
}
