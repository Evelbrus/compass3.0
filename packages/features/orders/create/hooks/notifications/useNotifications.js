//useNotifications.ts
import { useCallback } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { useSession } from '@shared/utils/hooks/useSession';
import { Action } from '@prisma/client';
export const useNotifications = ({ departurePoint, arrivalPoint, isEditing, }) => {
    const socket = useSocket('notification');
    const { userSession } = useSession();
    //Функция для отправки уведомления по API и через сокеты
    const sendNotification = useCallback(async (userId, title, msg, orderId, action = Action.info) => {
        console.log('sendNotification:', { userId, title, msg, orderId, action });
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, title, message: msg, orderId, action }),
            });
            if (!response.ok) {
                console.error('Failed to save notification to database:', response.statusText);
                return;
            }
            const data = await response.json();
            if (socket && userId && data.uuid) {
                socket.emit('notification', {
                    userId,
                    notification: { uuid: data.uuid, title, message: msg, orderId, action },
                });
            }
        }
        catch (error) {
            console.error('Error saving notification to database:', error);
        }
    }, [socket]);
    /**
     * Функция handleOrderSuccess принимает результат заказа (result) напрямую.
     * Использует departurePoint и arrivalPoint для формирования уведомительных сообщений.
     */
    const handleOrderSuccess = useCallback((result) => {
        const depAddress = departurePoint ? departurePoint.address : 'не указан';
        const arrAddress = arrivalPoint ? arrivalPoint.address : 'не указан';
        const actionText = isEditing ? 'обновлен' : 'создан';
        //Уведомление для водителя
        if (result.assignedDriverId) {
            const msgDriver = `Вам ${actionText} заказ от ${depAddress} до ${arrAddress}.`;
            sendNotification(result.assignedDriverId, `Заказ ${actionText}`, msgDriver, result.uuid, Action.noted);
        }
        else {
            console.warn('handleOrderSuccess: отсутствует assignedDriverId');
        }
        //Уведомление для текущего пользователя (создателя) через userSession
        if (userSession?.uuid) {
            const msgCreator = `Заказ от ${depAddress} до ${arrAddress} ${actionText}.`;
            sendNotification(userSession.uuid, `Заказ ${actionText}`, msgCreator, result.uuid, Action.info);
        }
        else {
            console.warn('handleOrderSuccess: отсутствует userSession');
        }
        //Уведомление для создателя заказа (если отличается)
        if (result.createdById) {
            const msgCreatedBy = `Ваш заказ от ${depAddress} до ${arrAddress} ${actionText}.`;
            sendNotification(result.createdById, `Заказ ${actionText}`, msgCreatedBy, result.uuid, Action.info);
        }
        else {
            console.warn('handleOrderSuccess: отсутствует createdById');
        }
    }, [departurePoint, arrivalPoint, isEditing, sendNotification, userSession]);
    const handleOrderError = useCallback((error) => {
        console.error('handleOrderError:', error);
    }, []);
    return {
        handleOrderSuccess,
        handleOrderError,
        sendNotification,
    };
};
export default useNotifications;
