'use client';
import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
export const NotificationList = ({ notifications, onClose }) => {
  return _jsxs('div', {
    className:
      'absolute top-12 right-0 bg-white shadow-lg rounded-lg p-4 w-64 max-h-80 overflow-y-auto',
    children: [
      _jsxs('div', {
        className: 'flex justify-between items-center mb-4',
        children: [
          _jsx('h3', {
            className: 'font-bold',
            children: '\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F',
          }),
          _jsx('button', {
            onClick: onClose,
            className: 'text-blue-600 hover:text-blue-800',
            children: '\u2715',
          }),
        ],
      }),
      notifications.map((notification) =>
        _jsxs(
          'div',
          {
            className: 'py-2 border-b last:border-b-0',
            children: [
              _jsx('p', { className: 'font-medium', children: notification.title }),
              _jsx('p', { className: 'text-sm text-gray-600', children: notification.message }),
            ],
          },
          notification.id,
        ),
      ),
    ],
  });
};
