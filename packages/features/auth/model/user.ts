import { createEffect, createStore } from 'effector';
import type { SessionUser } from './session';

export interface UserProfile extends SessionUser {
  name?: string;
  phone?: string;
}

//Эффекты
export const fetchUserProfileFx = createEffect<string, UserProfile>(async (uuid) => {
  const response = await fetch(`/api/users/${uuid}`);
  if (!response.ok) throw new Error('User not found');
  return response.json();
});

//Сторы
export const $userProfile = createStore<UserProfile | null>(null).on(
  fetchUserProfileFx.doneData,
  (_, profile) => profile,
);
