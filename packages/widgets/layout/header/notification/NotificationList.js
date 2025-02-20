import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useCallback, useState } from 'react';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { IButton } from '@shared/components/ui/buttons';
const NotificationList = ({ notifications, onClose, onClear, markAsRead, }) => {
    const notificationRefs = useRef([]);
    const observer = useRef(null);
    const [open, setOpen] = useState(notifications.reduce((acc, notification) => {
        acc[notification.uuid] = true;
        return acc;
    }, {}));
    const handleIntersection = useCallback((entries) => {
        entries.forEach((entry) => {
            const target = entry.target;
            const uuid = target.dataset.uuid;
            //Find the notification in the notifications array
            const notification = notifications.find((n) => n.uuid === uuid);
            //Check if the notification exists and is not yet read
            if (entry.isIntersecting && uuid && notification && !notification.read) {
                markAsRead(uuid);
                observer.current?.unobserve(target);
            }
        });
    }, [markAsRead, notifications]);
    useEffect(() => {
        observer.current = new IntersectionObserver(handleIntersection, {
            threshold: 0.5,
        });
        //Observe each notification
        notificationRefs.current.forEach((ref) => {
            if (ref) {
                observer.current?.observe(ref);
            }
        });
        return () => {
            //Cleanup: Unobserve all notifications
            observer.current?.disconnect();
            notificationRefs.current = [];
        };
    }, [handleIntersection, notifications]);
    const toggleOpen = (uuid) => {
        setOpen((prev) => ({
            ...prev,
            [uuid]: !prev[uuid],
        }));
    };
    return (_jsxs("div", { className: "absolute w-[400px] h-[400px] right-0 top-10 z-50 bg-[#EFEFEF] p-4 flex flex-col gap-2 justify-between rounded-md shadow-lg overflow-auto", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("h1", { className: "text-2xl font-bold text-gray-800", children: "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F" }), _jsx(IButton, { variant: "close", onClick: onClose, "aria-label": "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u043E\u0434\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E", className: "absolute top-2 right-2 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2", children: _jsx(CloseIcon, {}) })] }), _jsx("ul", { className: "max-h-68 overflow-y-auto", children: notifications.map((notification, index) => (_jsxs("li", { className: "p-2 border-b border-gray-200 rounded-lg last:border-b-0 bg-white mb-1", ref: (el) => {
                                if (el) {
                                    notificationRefs.current[index] = el;
                                }
                            }, "data-uuid": notification.uuid, onClick: () => toggleOpen(notification.uuid), children: [_jsxs("p", { className: "text-4 py-1 font-medium text-gray-500 flex items-center justify-between", children: [notification.title, ' ', _jsx("span", { children: new Date(notification.createdAt).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            }) }), _jsx("span", { className: `transform transition-transform ${open[notification.uuid] ? 'rotate-180' : 'rotate-0'}`, children: "\u25BC" })] }), _jsx("div", { className: `overflow-hidden transition-all duration-500 ease-in-out ${open[notification.uuid] ? 'max-h-screen' : 'max-h-0'}`, children: _jsx("p", { className: "font-semibold text-sm p-2 border-t border-gray-300", children: notification.message }) })] }, notification.uuid))) })] }), _jsx("div", { className: 'flex justify-end', children: _jsx("button", { onClick: onClear, className: "w-[200px] p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition text-sm", children: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C" }) })] }));
};
export default NotificationList;
