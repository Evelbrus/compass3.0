//'use client';
//
//import React, { useEffect, useState } from 'react';
//import { useUnit } from 'effector-react';
//import { IButton } from '@shared/components/ui/buttons';
//import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
//import { $driverOrderNotifications, WarningNotification } from '@shared/lib/effector';
//import { DriverAcceptanceStatus } from '@prisma/client';
//
////Последовательность этапов заказа для водителя и подписи на русском языке
//const statusSteps: { status: DriverAcceptanceStatus; label: string }[] = [
//{ status: DriverAcceptanceStatus.ON_THE_WAY, label: 'В пути' },
//{ status: DriverAcceptanceStatus.ARRIVED, label: 'Прибыл' },
//{ status: DriverAcceptanceStatus.PICKED_UP, label: 'Пассажир поднят' },
//{ status: DriverAcceptanceStatus.COMPLETED, label: 'Завершен' },
//];
//
//interface OrderProgressModalProps {
//onClose: () => void;
//}
//
//const OrderProgressModal: React.FC<OrderProgressModalProps> = ({ onClose }) => {
//console.log('откролось?');
//
////Получаем массив уведомлений водителя из Effector‑хранилища
//const notifications = useUnit($driverOrderNotifications);
//const [currentIndex, setCurrentIndex] = useState<number>(0);
//
//console.log('notifications', notifications);
//
////Текущее уведомление (с оператором !, чтобы TS не ругался)
//const currentNotification: WarningNotification = notifications[currentIndex]!;
//const orderId = currentNotification.orderId;
//
//const [orderData, setOrderData] = useState<any>(null);
//const [loading, setLoading] = useState<boolean>(false);
//const [patchLoading, setPatchLoading] = useState<boolean>(false);
//const [error, setError] = useState<string | null>(null);
//const [statusUpdateMsg, setStatusUpdateMsg] = useState<string | null>(null);
//
////Функция загрузки данных заказа по orderId из текущего уведомления
//const fetchOrderData = async () => {
//if (!orderId) return;
//setLoading(true);
//try {
//const response = await fetch(`/api/orders/${orderId}`);
//if (!response.ok) {
//throw new Error(`Ошибка получения заказа: ${response.statusText}`);
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
////Функция обновления статуса заказа
//const updateOrderStatus = async (newStatus: DriverAcceptanceStatus) => {
//if (!orderId) return;
//setPatchLoading(true);
//setStatusUpdateMsg(null);
//try {
//const response = await fetch(`/api/orders/drivers/${orderId}`, {
//method: 'PATCH',
//headers: {
//'Content-Type': 'application/json',
//},
//body: JSON.stringify({ driverProgressStatus: newStatus }),
//});
//if (!response.ok) {
//throw new Error(`Ошибка обновления статуса: ${response.statusText}`);
//}
//const data = await response.json();
//setStatusUpdateMsg(`Статус обновлен на "${newStatus}"`);
//
////Если статус стал COMPLETED, помечаем уведомление как прочитанное
//if (newStatus === DriverAcceptanceStatus.COMPLETED) {
//await markNotificationAsRead();
//}
//
////Обновляем данные заказа после изменения статуса
//await fetchOrderData();
//} catch (err) {
//console.error('Ошибка при обновлении статуса заказа:', err);
//setError(err instanceof Error ? err.message : 'Ошибка при обновлении статуса заказа');
//} finally {
//setPatchLoading(false);
//}
//};
//
////Функция определения следующего шага обновления заказа
//const getNextStep = (): { status: DriverAcceptanceStatus; label: string } | null => {
//if (!orderData) return null;
//const currentStatus: DriverAcceptanceStatus = orderData.driverProgressStatus;
//const currentIndexStep = statusSteps.findIndex((step) => step.status === currentStatus);
//if (currentIndexStep === -1) {
////Если текущий статус не найден, начинаем с первого этапа
//return statusSteps[0] ?? null;
//}
//if (currentIndexStep >= statusSteps.length - 1) {
////Если достигли последнего этапа, следующих шагов нет
//return null;
//}
//return statusSteps[currentIndexStep + 1] ?? null;
//};
//
//const nextStep = getNextStep();
//
////Функция для пометки текущего уведомления как прочитанного
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
////Обёртка для закрытия модалки
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
//Уведомление {currentIndex + 1} из {notifications.length}
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
//<strong>Текущий статус заказа:</strong>{' '}
//{orderData.driverProgressStatus || 'Не указан'}
//</p>
//<p>
//<strong>Дата подачи:</strong> {new Date(orderData.departureTime).toLocaleString()}
//</p>
//<div className="mt-4">
//{nextStep ? (
//<>
//<p className="mb-2 font-semibold">
//Обновите статус заказа на: "{nextStep.label}"
//</p>
//<IButton
//onClick={() => updateOrderStatus(nextStep.status)}
//disabled={patchLoading}
//>
//{nextStep.label}
//</IButton>
//</>
//) : (
//<p>Все этапы обновления завершены.</p>
//)}
//<div className="mt-4">
//<IButton
//onClick={() => updateOrderStatus(DriverAcceptanceStatus.CANCELLED)}
//disabled={patchLoading}
//>
//Отменить заказ
//</IButton>
//</div>
//{patchLoading && <p className="mt-2">Обновление статуса...</p>}
//{statusUpdateMsg && <p className="mt-2 text-green-600">{statusUpdateMsg}</p>}
//</div>
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
//export default OrderProgressModal;
