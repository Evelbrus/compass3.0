import React from 'react';

interface NotedStageProps {
  onMarkAsRead: () => void;
  notificationRead: boolean;
}

const NotedStage: React.FC<NotedStageProps> = ({ onMarkAsRead, notificationRead }) => {
  return (
    <div className="flex justify-center mt-6">
      {notificationRead ? (
        <div className="px-6 py-2 bg-green-500 text-white rounded cursor-default">
          Ознакомился (Прочитано)
        </div>
      ) : (
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={onMarkAsRead}
        >
          Ознакомился
        </button>
      )}
    </div>
  );
};

export default NotedStage;