import { UserRole } from '@prisma/client';

// Расширенный интерфейс UserSession
export interface UserSession {
  uuid: string;
  email: string;
  fullName: string;
  role: UserRole;
  lastActive: Date | null;
  phone: string;
  companyProfile?: {
    companyName: string;
    phone: string;
    logoImagePath?: string | null;
  } | null;
}