import { CustomUser } from '@shared/lib/api/authOptions';

export interface HeaderProps {
  lang: string;
  isAuthenticated: boolean;
  userProfile: CustomUser | null;
}
