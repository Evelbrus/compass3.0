import { createEffect, createStore } from 'effector';
//Эффекты
export const fetchUserProfileFx = createEffect(async (uuid) => {
    const response = await fetch(`/api/users/${uuid}`);
    if (!response.ok)
        throw new Error('User not found');
    return response.json();
});
//Сторы
export const $userProfile = createStore(null).on(fetchUserProfileFx.doneData, (_, profile) => profile);
