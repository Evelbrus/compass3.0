import { createEffect, createEvent, createStore, sample } from 'effector';

export interface SessionUser {
  uuid: string;
  email: string;
  role: string;
}

//События
export const checkAuth = createEvent();
export const login = createEvent<{ email: string; password: string }>();
export const logout = createEvent();

//Эффекты
export const checkAuthFx = createEffect<void, SessionUser | null>(async () => {
  const response = await fetch('/api/auth/session');
  if (!response.ok) return null;
  return response.json();
});

export const loginFx = createEffect<{ email: string; password: string }, void>(
  async ({ email, password }) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }
  },
);

export const logoutFx = createEffect<void, void>(async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
});

//Сторы
export const $sessionUser = createStore<SessionUser | null>(null)
  .on(checkAuthFx.doneData, (_, user) => user)
  .reset(logoutFx.done);

export const $isAuthenticated = $sessionUser.map((user) => !!user);
export const $authError = createStore<string | null>(null)
  .on([loginFx.fail, logoutFx.fail], (_, { error }) => error.message)
  .reset([loginFx.done, logoutFx.done, checkAuthFx.done]);

//Интеграция
sample({
  clock: login,
  target: loginFx,
});

sample({
  clock: logout,
  target: logoutFx,
});

sample({
  clock: checkAuth,
  target: checkAuthFx,
});

sample({
  clock: logoutFx.done,
  fn: () => {
    window.location.href = '/login';
  },
});
