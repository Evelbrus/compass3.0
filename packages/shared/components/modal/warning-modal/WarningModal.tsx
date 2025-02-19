//'use client';
//
//import React, { useEffect, useState } from 'react';
//import { useUnit } from 'effector-react';
//import { IButton } from '@shared/components/ui/buttons';
//import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
//import { $driverOrderNotifications, WarningNotification } from '@shared/lib/effector';
//
//interface WarningModalProps {
//onClose: () => void;
//}
//
//const WarningModal: React.FC<WarningModalProps> = ({ onClose }) => {
////Получаем массив уведомлений водителя из Effector‑хранилища
//const notifications = useUnit($driverOrderNotifications);
//const [currentIndex, setCurrentIndex] = useState<number>(0);
//
////Если уведомлений нет — ничего не отображаем
//if (notifications.length === 0) {
//return null;
//}
//
////Текущее уведомление
//const currentNotification: WarningNotification = notifications[currentIndex]!;
//const orderId = currentNotification.orderId;
//
//const [orderData, setOrderData] = useState<any>(null);
//const [loading, setLoading] = useState<boolean>(false);
//const [error, setError] = useState<string | null>(null);
//
////Функция загрузки данных заказа
//const fetchOrderData = async () => {
//if (!orderId) return;
//setLoading(true);
//try {
//const response = await fetch(`/api/orders/${orderId}`);
//if (!response.ok) {
//throw new Error(`Ошибка получения данных заказа: ${response.statusText}`);
//}
//const data = await response.json();
//setOrderData(data);
//} catch (err) {
//console.error('Ошибка при загрузке данных заказа:', err);
//setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных заказа');
//} finally {
//setLoading(false);
//}
//};
//
//useEffect(() => {
//fetchOrderData();
//}, [orderId]);
//
////Функция для пометки уведомления как прочитанного
//const markNotificationAsRead = async () => {
//try {
//const response = await fetch(`/api/notifications/${currentNotification.uuid}`, {
//method: 'PATCH',
//headers: {
//'Content-Type': 'application/json',
//},
//body: JSON.stringify({ read: true }),
//});
//if (!response.ok) {
//throw new Error(`Ошибка обновления уведомления: ${response.statusText}`);
//}
//console.log('Уведомление отмечено как прочитанное');
//} catch (err) {
//console.error('Ошибка при обновлении уведомления:', err);
//}
//};
//
////Переход к предыдущему уведомлению
//const handlePrev = () => {
//if (currentIndex > 0) {
//setCurrentIndex((prev) => prev - 1);
//}
//};
//
////Переход к следующему уведомлению
//const handleNext = () => {
//if (currentIndex < notifications.length - 1) {
//setCurrentIndex((prev) => prev + 1);
//}
//};
//
////Закрытие модалки + пометка уведомления как прочитанного
//const handleClose = async () => {
//await markNotificationAsRead();
//onClose();
//};
//
//return (
//<div className="fixed inset-0 flex flex-col items-center justify-center bg-black/50 z-50 p-4">
//<AnimatedComponent duration={500} className="bg-white rounded-3xl p-8 w-full max-w-xl">
//{notifications.length > 1 && (
//<div className="flex justify-between mb-4">
//<IButton onClick={handlePrev} disabled={currentIndex === 0}>
//Назад
//</IButton>
//<IButton onClick={handleNext} disabled={currentIndex === notifications.length - 1}>
//Вперёд
//</IButton>
//</div>
//)}
//<h2 className="text-xl font-bold mb-4">
//Предупреждение {currentIndex + 1} из {notifications.length}
//</h2>
//{loading ? (
//<p>Загрузка данных заказа...</p>
//) : error ? (
//<p className="text-red-500">{error}</p>
//) : orderData ? (
//<div>
//<p>
//<strong>ID заказа:</strong> {orderData.uuid}
//</p>
//<p>
//<strong>Сообщение:</strong> {currentNotification.message || 'Нет подробностей'}
//</p>
//<p>
//<strong>Дата:</strong> {new Date(currentNotification.createdAt).toLocaleString()}
//</p>
//{/*Добавьте другие данные заказа при необходимости */}
//</div>
//) : (
//<p>Данных о заказе не найдено.</p>
//)}
//<IButton onClick={handleClose} className="mt-4">
//Закрыть
//</IButton>
//</AnimatedComponent>
//</div>
//);
//};
//
//export default WarningModal;
