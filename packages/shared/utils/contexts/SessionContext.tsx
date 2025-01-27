import { createContext } from 'react';
import { UserSession } from '@shared/prisma/interface/users/interface';

interface SessionContextType {
  userSession: UserSession | null;
}

export const SessionContext = createContext<SessionContextType>({
  userSession: null,
});
