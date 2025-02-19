import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo, useRef, useEffect } from 'react';
import { useNotifications, } from '@features/notifications/lib/useNotifications';
import NotificationList from '@widgets/layout/header/notification/NotificationList';
import DriverNotificationList from '@widgets/layout/header/notification/DriverNotificationList';
import { LazyImage } from '@shared/components/ui/images';
import { Action } from '@prisma/client';
import OrderInfoModal from '@widgets/orders/modal/driver/order-management/OrderInfoModal';
import OrderProgressModal from '@widgets/orders/modal/driver/order-management/OrderProgressModal';
import WarningModal from '@widgets/orders/modal/driver/order-management/WarningModal';
import WarningAdminModal from '@widgets/orders/modal/driver/order-management/WarningAdminModal';
const Notification = ({ userSession }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDriverOpen, setIsDriverOpen] = useState(false);
    const notificationRef = useRef(null);
    //Получаем уведомления и функции из хука
    const { notifications, clearNotifications, markAsRead, activeModal, openModal, closeModal } = useNotifications({ userSession });
    //Общее количество непрочитанных уведомлений
    const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
    //Фильтрация уведомлений для водителя
    const driverNotifications = useMemo(() => notifications.filter((n) => n.action === Action.noted ||
        n.action === Action.inProgress ||
        n.action === Action.warning), [notifications]);
    //Количество непрочитанных уведомлений для водителя
    const driverUnreadCount = useMemo(() => driverNotifications.filter((n) => !n.read).length, [driverNotifications]);
    //Выбираем текущее уведомление для модалки OrderInfoModal.
    //Например, берём первое уведомление с действием Action.noted, предпочтительно с флагом !read.
    const currentNotificationForOrderInfo = useMemo(() => {
        return (notifications.find((n) => n.action === Action.noted && !n.read) ||
            notifications.find((n) => n.action === Action.noted));
    }, [notifications]);
    useEffect(() => {
        const handleClick = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsOpen(false);
                setIsDriverOpen(false);
            }
        };
        const handleScroll = () => {
            setIsOpen(false);
            setIsDriverOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('scroll', handleScroll);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return (_jsxs(_Fragment, { children: [activeModal === Action.noted && currentNotificationForOrderInfo && (_jsx(OrderInfoModal, { isOpen: true, onClose: closeModal, orderUuid: currentNotificationForOrderInfo.orderId, notificationUuid: currentNotificationForOrderInfo.uuid, isNotificationRead: currentNotificationForOrderInfo.read })), activeModal === Action.inProgress && _jsx(OrderProgressModal, { isOpen: true, onClose: closeModal }), activeModal === Action.warning && _jsx(WarningModal, { isOpen: true, onClose: closeModal }), activeModal === Action.warning && _jsx(WarningAdminModal, { isOpen: true, onClose: closeModal }), _jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "p-2 rounded-full bg-[#2A3037] hover:bg-gray-100 shadow-md transition-colors group", "aria-label": "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F", children: [_jsx(LazyImage, { src: "/icons/bell.svg", alt: "notification-icon", className: "w-[18px] h-[18px] duration-200 filter invert-0 group-hover:invert" }), unreadCount > 0 && (_jsx("span", { className: "absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center", children: unreadCount }))] }), userSession?.role === 'Driver' && (_jsxs("button", { onClick: () => setIsDriverOpen(!isDriverOpen), className: "ml-2 p-2 rounded-full bg-[#2A3037] hover:bg-gray-100 shadow-md transition-colors group", "aria-label": "\u0423\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F", children: [_jsx(LazyImage, { src: "/icons/driver-bell.svg", alt: "driver-notification-icon", className: "w-[18px] h-[18px] duration-200 filter invert-0 group-hover:invert" }), driverUnreadCount > 0 && (_jsx("span", { className: "absolute top-0 right-0 bg-blue-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center", children: driverUnreadCount }))] })), isOpen && (_jsx("div", { ref: notificationRef, children: _jsx(NotificationList, { notifications: notifications, onClose: () => setIsOpen(false), onClear: clearNotifications, markAsRead: markAsRead }) })), isDriverOpen && (_jsx("div", { ref: notificationRef, children: _jsx(DriverNotificationList, { notifications: driverNotifications, onClose: () => setIsDriverOpen(false), openModal: openModal }) }))] })] }));
};
export default Notification;
