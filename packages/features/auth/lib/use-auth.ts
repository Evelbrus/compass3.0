import { useUnit } from 'effector-react';
import { useEffect } from 'react';
import {
  $sessionUser,
  $isAuthenticated,
  $authError,
  checkAuth,
  login,
  logout,
  loginFx,
  logoutFx,
  checkAuthFx,
} from '../model/session';

export const useAuth = () => {
  const sessionUser = useUnit($sessionUser);
  const isAuthenticated = useUnit($isAuthenticated);
  const error = useUnit($authError);
  const checkAuthEvent = useUnit(checkAuth);
  const loginEvent = useUnit(login);
  const logoutEvent = useUnit(logout);

  const isLoading = useUnit(loginFx.pending);
  const isLoggingOut = useUnit(logoutFx.pending);
  const isCheckingAuth = useUnit(checkAuthFx.pending);

  useEffect(() => {
    checkAuthEvent();
  }, [checkAuthEvent]);

  return {
    userProfile: sessionUser,
    isAuthenticated,
    error,
    isLoading: isLoading || isCheckingAuth,
    isLoggingOut,
    login: loginEvent,
    logout: logoutEvent,
  };
};
