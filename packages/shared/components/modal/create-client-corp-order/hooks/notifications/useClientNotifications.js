import { useCallback } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { useSession } from '@shared/utils/hooks/useSession';
import { UserRole, Action } from '@prisma/client';
export const useClientNotifications = ({ departurePoint, arrivalPoint, }) => {
    const socket = useSocket();
    const { userSession } = useSession();
    const formatOrderNumber = (date) => {
        if (!date) {
            console.warn('Некорректная дата для формирования номера заказа:', date);
            return 'N/A';
        }
        try {
            const formatter = new Intl.DateTimeFormat('ru-RU', {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            });
            return formatter.format(date).replace(/[.,\s:]/g, '');
        }
        catch (error) {
            console.error('Ошибка при форматировании даты:', error);
            return 'N/A';
        }
    };
    const sendNotification = useCallback(async (userId, title, message, orderId, action = Action.info) => {
        if (!userSession?.uuid) {
            console.warn('Нет userSession для отправки уведомления');
            return;
        }
        try {
            const response = await fetch('/api/client-corp/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    title,
                    message,
                    orderId,
                    action,
                    createdById: userSession.uuid,
                }),
            });
            if (!response.ok) {
                console.error('Ошибка при сохранении уведомления');
                return;
            }
            const data = await response.json();
            console.log('Отправляем индивидуальное уведомление:', {
                userId,
                title,
                message,
                orderId,
                action,
                data,
            });
            if (socket && userId && data.uuid) {
                socket.emit('notification', {
                    userId,
                    notification: { uuid: data.uuid, title, message, orderId, action, read: false },
                });
            }
        }
        catch (error) {
            console.error('Ошибка при сохранении уведомления:', error);
        }
    }, [socket, userSession]);
    const sendCreatorNotification = useCallback(async (orderId) => {
        if (socket && userSession?.uuid && departurePoint && arrivalPoint) {
            const orderNumber = formatOrderNumber(new Date());
            const title = 'Заказ создан';
            const message = `Ваш заказ N ${orderNumber} создан от ${departurePoint.address} до ${arrivalPoint.address}`;
            await sendNotification(userSession.uuid, title, message, orderId, Action.info);
        }
    }, [socket, userSession, departurePoint, arrivalPoint, sendNotification]);
    const sendOperatorAdminNotification = useCallback(async (orderId) => {
        if (socket && departurePoint && arrivalPoint) {
            const orderNumber = formatOrderNumber(new Date());
            const title = 'Новый заказ';
            const message = `Новый заказ N ${orderNumber} создан от ${departurePoint.address} до ${arrivalPoint.address}`;
            console.log('Отправляем broadcast уведомление:', {
                roles: [UserRole.Operator, UserRole.Admin],
                title,
                message,
            });
            socket.emit('notification', {
                roles: [UserRole.Operator, UserRole.Admin],
                notification: { title, message, orderId, action: Action.info },
            });
        }
    }, [socket, departurePoint, arrivalPoint]);
    const handleOrderSuccess = useCallback((result) => {
        const orderId = result.uuid;
        sendCreatorNotification(orderId);
        sendOperatorAdminNotification(orderId);
        console.log('Заказ успешно создан и уведомления отправлены:', result);
    }, [sendCreatorNotification, sendOperatorAdminNotification]);
    const handleOrderError = useCallback((error) => {
        console.error('Ошибка при создании заказа:', error?.message || error);
    }, []);
    return {
        handleOrderSuccess,
        handleOrderError,
        sendNotification,
        sendCreatorNotification,
        sendOperatorAdminNotification,
    };
};
export default useClientNotifications;
