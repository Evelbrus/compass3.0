import { useCallback } from 'react';
import { useSocket } from '@shared/utils/hooks/useSocket';
import { useSession } from '@shared/utils/hooks/useSession';
import { UserRole } from '@prisma/client';
export const useClientNotifications = ({ departurePoint, arrivalPoint, }) => {
    const socket = useSocket();
    const { userSession } = useSession();
    //Форматирование номера заказа на основе текущей даты
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
    //Универсальная функция отправки уведомления конкретному пользователю
    const sendNotification = useCallback(async (userId, title, message) => {
        try {
            const response = await fetch('/api/client-corp/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roles: [UserRole.Operator, UserRole.Admin], //Передаем массив ролей
                    title, //Используем динамически переданный title
                    message, //Используем динамически переданный message
                }),
            });
            if (!response.ok) {
                console.error('Ошибка при сохранении уведомления');
                return;
            }
            const data = await response.json();
            if (socket && userId && data.uuid) {
                socket.emit('notification', {
                    userId,
                    notification: {
                        uuid: data.uuid,
                        title,
                        message,
                    },
                });
            }
        }
        catch (error) {
            console.error('Ошибка при сохранении уведомления:', error);
        }
    }, [socket]);
    //Отправка уведомления для создателя заказа (текущего клиента)
    const sendCreatorNotification = useCallback(async () => {
        if (socket && userSession?.uuid && departurePoint && arrivalPoint) {
            const orderNumber = formatOrderNumber(new Date());
            const title = 'Заказ создан';
            const message = `Ваш заказ N ${orderNumber} создан от ${departurePoint.address} до ${arrivalPoint.address}`;
            await sendNotification(userSession.uuid, title, message);
        }
    }, [socket, userSession, departurePoint, arrivalPoint, sendNotification]);
    //Отправка уведомления всем операторам и администраторам через broadcast
    const sendOperatorAdminNotification = useCallback(async () => {
        if (socket && departurePoint && arrivalPoint) {
            const orderNumber = formatOrderNumber(new Date());
            const title = 'Новый заказ';
            const message = `Новый заказ N ${orderNumber} создан от ${departurePoint.address} до ${arrivalPoint.address}`;
            //Сервер должен обработать это событие и разослать уведомление пользователям с ролями operator и admin
            socket.emit('broadcastNotification', {
                roles: ['operator', 'admin'], //Если сервер ожидает строки, оставляем так
                notification: { title, message },
            });
        }
    }, [socket, departurePoint, arrivalPoint]);
    //Обработчик успешного создания заказа, который инициирует отправку уведомлений
    const handleOrderSuccess = useCallback(() => {
        sendCreatorNotification();
        sendOperatorAdminNotification();
        console.log('Заказ успешно создан и уведомления отправлены');
    }, [sendCreatorNotification, sendOperatorAdminNotification]);
    //Обработчик ошибки создания заказа (при необходимости можно расширить)
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
