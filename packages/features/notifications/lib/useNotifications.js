import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
export const useNotifications = ({ userSession }) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const openModal = useCallback((action) => {
        setActiveModal(action);
    }, []);
    const closeModal = useCallback(() => {
        setActiveModal(null);
    }, []);
    const handleNotification = useCallback((notification) => {
        console.log('📩 Получено уведомление:', notification);
        setNotifications((prev) => {
            const existingIndex = prev.findIndex((n) => n.uuid === notification.uuid);
            if (existingIndex !== -1) {
                const updatedNotifications = [...prev];
                updatedNotifications[existingIndex] = notification;
                if (!notification.read && prev[existingIndex].action !== notification.action) {
                    openModal(notification.action);
                }
                return updatedNotifications;
            }
            if (!notification.read) {
                openModal(notification.action);
            }
            return [notification, ...prev];
        });
    }, [openModal]);
    const socket = useSocket('notification', handleNotification);
    useEffect(() => {
        const fetchNotifications = async () => {
            if (!userSession)
                return;
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/notifications?userId=${userSession.uuid}`);
                if (!response.ok) {
                    throw new Error(`Ошибка загрузки уведомлений: ${response.statusText}`);
                }
                const data = await response.json();
                setNotifications(data);
                const unreadNotification = data.find((n) => !n.read);
                if (unreadNotification) {
                    openModal(unreadNotification.action);
                }
            }
            catch (err) {
                console.error('Ошибка при получении уведомлений:', err);
                setError(err instanceof Error ? err.message : 'Не удалось получить уведомления');
                setNotifications([]);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();
        if (socket && userSession) {
            const registerUser = () => {
                socket.emit('register', { userId: userSession.uuid, role: userSession.role });
            };
            if (socket.connected) {
                registerUser();
            }
            else {
                socket.on('connect', registerUser);
            }
            return () => {
                socket.off('connect', registerUser);
                socket.off('notification');
            };
        }
    }, [userSession, socket, openModal]);
    const clearNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await Promise.all(notifications.map(async (notification) => {
                const response = await fetch(`/api/notifications/${notification.uuid}`, {
                    method: 'DELETE',
                });
                if (!response.ok) {
                    throw new Error(`Не удалось удалить уведомление ${notification.uuid}: ${response.statusText}`);
                }
            }));
            setNotifications([]);
            setActiveModal(null);
        }
        catch (err) {
            console.error('Ошибка при очистке уведомлений:', err);
            setError(err instanceof Error ? err.message : 'Не удалось очистить уведомления');
        }
        finally {
            setIsLoading(false);
        }
    }, [notifications]);
    const markAsRead = useCallback(async (notificationId) => {
        try {
            const response = await fetch(`/api/notifications/${notificationId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true }),
            });
            if (!response.ok) {
                throw new Error(`Не удалось пометить уведомление как прочитанное: ${response.statusText}`);
            }
            setNotifications((prev) => prev.map((notification) => notification.uuid === notificationId ? { ...notification, read: true } : notification));
        }
        catch (err) {
            console.error('Ошибка при пометке уведомления как прочитанного:', err);
            setError(err instanceof Error ? err.message : 'Не удалось пометить уведомление как прочитанное');
        }
    }, []);
    return {
        notifications,
        isLoading,
        error,
        activeModal,
        openModal,
        closeModal,
        clearNotifications,
        markAsRead,
    };
};
export default useNotifications;
