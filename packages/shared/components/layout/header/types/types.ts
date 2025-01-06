import { User } from '@prisma/client';

export interface HeaderProps {
  lang: string;
  isAuthenticated: boolean;
  userProfile: User | null;
}
