'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { publicRoutes } from '@shared/utils/routing';
const Profile = dynamic(() => import('@widgets/layout/header/profile/Profile'), {
    ssr: false,
    loading: () => _jsx("div", { className: "w-8 h-8 bg-gray-200 rounded-full" }),
});
const Notification = dynamic(() => import('@widgets/layout/header/notification/Notification'), {
    ssr: false,
    loading: () => _jsx("div", { className: "w-8 h-8 bg-gray-200 rounded-full" }),
});
const HeaderContainer = ({ userSession }) => {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const handleNavigate = (route) => {
        router.prefetch(route);
        router.push(route);
    };
    const logout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Ошибка при выходе');
            }
            router.push(publicRoutes.LOGIN);
            router.refresh();
        }
        catch (error) {
            console.error('Ошибка:', error);
        }
        finally {
            setIsLoggingOut(false);
        }
    };
    return (_jsxs("div", { className: "w-full flex flex-row justify-between", children: [_jsx(Profile, { userSession: userSession, onLogout: logout, onNavigate: handleNavigate }), _jsx(Notification, { userSession: userSession })] }));
};
export default HeaderContainer;
