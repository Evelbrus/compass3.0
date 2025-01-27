'use client';

export const NotificationList = ({
  notifications,
  onClose,
}: {
  notifications: Notification[];
  onClose: () => void;
}) => {
  return (
    <div className="absolute top-12 right-0 bg-white shadow-lg rounded-lg p-4 w-64 max-h-80 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Уведомления</h3>
        <button onClick={onClose} className="text-blue-600 hover:text-blue-800">
          ✕
        </button>
      </div>

      {notifications.map((notification) => (
        <div key={notification.id} className="py-2 border-b last:border-b-0">
          <p className="font-medium">{notification.title}</p>
          <p className="text-sm text-gray-600">{notification.message}</p>
        </div>
      ))}
    </div>
  );
};
