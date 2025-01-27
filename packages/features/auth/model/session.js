import { createEffect, createEvent, createStore } from 'effector';
import { signIn, signOut, getSession } from 'next-auth/react';
//События
export const checkAuth = createEvent();
export const login = createEvent();
export const logout = createEvent();
//Эффекты
export const checkAuthFx = createEffect(async () => {
    const session = await getSession();
    return session?.user ?? null;
});
export const loginFx = createEffect(async ({ email, password }) => {
    const response = await signIn('credentials', { email, password, redirect: false });
    if (response?.error)
        throw new Error(response.error);
});
export const logoutFx = createEffect(async () => {
    await signOut({ redirect: false });
});
//Сторы
export const $sessionUser = createStore(null)
    .on(checkAuthFx.doneData, (_, user) => user)
    .reset(logoutFx.done);
export const $isAuthenticated = $sessionUser.map((user) => !!user);
