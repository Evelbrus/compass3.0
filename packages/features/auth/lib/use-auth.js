import { useUnit } from 'effector-react';
import { useEffect } from 'react';
export const useAuth = () => {
    const { $sessionUser, $isAuthenticated, $userProfile, checkAuth, login, logout, fetchUserProfileFx, } = useUnit(authModel);
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);
    useEffect(() => {
        const user = $sessionUser.getState();
        if (user?.uuid && !$userProfile.getState()) {
            fetchUserProfileFx(user.uuid);
        }
    }, [$sessionUser, $userProfile, fetchUserProfileFx]);
    return {
        session: $sessionUser,
        profile: $userProfile,
        isAuthenticated: $isAuthenticated,
        login,
        logout,
    };
};
