import { useContext } from 'react';
import { SessionContext } from '@shared/utils/contexts/SessionContext';
/**
 * Хук для доступа к данным сессии пользователя.
 * Возвращает объект с полями:
 * - userSession: данные пользователя (или null, если пользователь не авторизован).
 * - setUserSession: функция для обновления данных пользователя.
 *
 * @throws {Error} Если хук используется вне SessionProvider.
 */
export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
