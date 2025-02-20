import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { Action } from '@prisma/client';
import { bulkDeleteNotifications, fetchNotifications, markNotificationAsRead, } from '@features/notifications/api/apiNotifications';
export const useNotifications = ({ userSession }) => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeNotification, setActiveNotification] = useState(null);
    const openModal = useCallback((notification) => {
        console.log(`Открытие модалки для уведомления ${notification.uuid} с action: ${notification.action}`);
        setActiveNotification(notification);
    }, []);
    const closeModal = useCallback(() => {
        setActiveNotification(null);
    }, []);
    const handleNotification = useCallback((notification) => {
        console.log('📩 Получено уведомление:', notification);
        setNotifications((prev) => {
            const existingIndex = prev.findIndex((n) => n.uuid === notification.uuid);
            if (existingIndex !== -1) {
                const updatedNotifications = [...prev];
                updatedNotifications[existingIndex] = notification;
                if (!notification.read) {
                    openModal(notification);
                }
                return updatedNotifications;
            }
            if (!notification.read) {
                openModal(notification);
            }
            return [notification, ...prev];
        });
    }, [openModal]);
    const socket = useSocket('notification', handleNotification);
    const clearNotifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const notificationsToDelete = notifications.filter((notification) => notification.action !== Action.noted && notification.action !== Action.inProgress);
            if (notificationsToDelete.length === 0) {
                console.log('ℹ️ Нет уведомлений для удаления (исключены noted и inProgress)');
                setIsLoading(false);
                return;
            }
            await bulkDeleteNotifications(notificationsToDelete.map((n) => n.uuid));
            setNotifications((prev) => prev.filter((notification) => notification.action === Action.noted || notification.action === Action.inProgress));
            if (activeNotification &&
                !notificationsToDelete.some((n) => n.uuid === activeNotification.uuid)) {
                setActiveNotification(null);
            }
        }
        catch (err) {
            console.error('Ошибка при очистке уведомлений:', err);
            setError(err instanceof Error ? err.message : 'Не удалось очистить уведомления');
        }
        finally {
            setIsLoading(false);
        }
    }, [notifications, activeNotification]);
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications((prev) => prev.map((notification) => notification.uuid === notificationId ? { ...notification, read: true } : notification));
        }
        catch (err) {
            console.error('Ошибка при пометке уведомления как прочитанного:', err);
            setError(err instanceof Error ? err.message : 'Не удалось пометить уведомление как прочитанное');
        }
    }, []);
    useEffect(() => {
        const loadNotifications = async () => {
            if (!userSession)
                return;
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchNotifications(userSession.uuid);
                setNotifications(data);
                const unreadNotification = data.find((n) => !n.read);
                if (unreadNotification) {
                    openModal(unreadNotification);
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
        loadNotifications();
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
    return {
        notifications,
        isLoading,
        error,
        activeNotification,
        openModal,
        closeModal,
        clearNotifications,
        markAsRead,
    };
};
export default useNotifications;
