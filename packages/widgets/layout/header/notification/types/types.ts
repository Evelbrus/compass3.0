import { ExtendedNotification } from '@features/notifications/lib/useNotifications';
import { UserRole } from '@prisma/client';

// Интерфейс пропсов компонента уведомлений
export interface NotificationListProps {
  userSession: { role?: UserRole } | null | undefined;
  notifications: ExtendedNotification[];
  driverNotifications: ExtendedNotification[];
  clientNotifications: ExtendedNotification[];
  onClose: () => void;
  onClear?: () => void;
  markAsRead?: (notificationId: string) => void;
  openModal?: (notification: ExtendedNotification) => void;
}
