//'use client';
//
//import React, { useState, useEffect } from 'react';
//import { DriverAcceptanceStatus } from '@prisma/client';
//import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
//import { IButton } from '@shared/components/ui/buttons';
//import { CloseIcon } from '@shared/components/ui/icon';
//import { TextInput } from '@shared/components/ui/inputs';
//import { Notification } from '@prisma/client';
//
//interface OrderInfoModalProps {
//isOpen: boolean;
//onClose: () => void;
//currentNotification: Notification;
//notifications: Notification[];
//}
//
//const OrderInfoModal: React.FC<OrderInfoModalProps> = ({
//isOpen,
//onClose,
//currentNotification,
//notifications,
//}) => {
//const [orderData, setOrderData] = useState<any>(null);
//const [loading, setLoading] = useState(false);
//const [error, setError] = useState<string | null>(null);
//const [currentIndex, setCurrentIndex] = useState(0);
//
////При монтировании устанавливаем текущий индекс уведомления
//useEffect(() => {
//const index = notifications.findIndex((n) => n.uuid === currentNotification.uuid);
//if (index !== -1) {
//setCurrentIndex(index);
//}
//}, [currentNotification, notifications]);
//
////При монтировании модалки отправляем PATCH-запрос для обновления статуса заказа
//useEffect(() => {
//if (!currentNotification || !currentNotification.orderId) return;
//
//fetch(`/api/orders/drivers/${currentNotification.orderId}`, {
//method: 'PATCH',
//headers: {
//'Content-Type': 'application/json',
//},
//body: JSON.stringify({
//driverProgressStatus: DriverAcceptanceStatus.TAKEN,
//}),
//})
//.then((res) => {
//if (!res.ok) {
//throw new Error(`Ошибка обновления заказа: ${res.statusText}`);
//}
//return res.json();
//})
//.then((data) => {
//console.log('Заказ обновлён (PATCH):', data);
//})
//.catch((err) => {
//console.error('Ошибка при отправке PATCH-запроса:', err);
//});
//}, [currentNotification]);
//
////Загружаем данные заказа по orderId из текущего уведомления
//useEffect(() => {
//if (!currentNotification || !currentNotification.orderId) return;
//setLoading(true);
//fetch(`/api/orders/${currentNotification.orderId}`)
//.then((res) => {
//if (!res.ok) {
//throw new Error(`Ошибка получения заказа: ${res.statusText}`);
//}
//return res.json();
//})
//.then((data) => {
//setOrderData(data);
//setLoading(false);
//})
//.catch((err) => {
//console.error('Ошибка при загрузке данных заказа:', err);
//setError(err instanceof Error ? err.message : 'Ошибка при загрузке данных заказа');
//setLoading(false);
//});
//}, [currentNotification]);
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
////При необходимости можно обновлять currentNotification через callback в родительском компоненте
//}
//};
//
////Переход к следующему уведомлению
//const handleNext = () => {
//if (currentIndex < notifications.length - 1) {
//setCurrentIndex((prev) => prev + 1);
////Аналогично, можно обновлять currentNotification через callback
//}
//};
//
////При закрытии модалки помечаем текущее уведомление как прочитанное и закрываем модалку
//const handleClose = async () => {
//await markNotificationAsRead();
//onClose();
//};
//
//if (!isOpen) return null;
//
////Функция-заглушка для onChange, так как поля только для чтения
//const noop = () => {};
//
//return (
//<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
//<AnimatedComponent duration={500}>
//<div className="relative flex flex-col justify-between bg-white rounded-3xl w-[500px] max-w-[500px] gap-4 p-6">
//<div className="flex justify-between items-center">
//<h2 className="text-2xl font-bold">Информация о заказе</h2>
//<IButton
//variant="close"
//onClick={handleClose}
//aria-label="Закрыть модальное окно"
//className="border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full"
//>
//<CloseIcon />
//</IButton>
//</div>
//
//<div className="p-4">
//{loading ? (
//<p>Загрузка данных заказа...</p>
//) : error ? (
//<p className="text-red-500">{error}</p>
//) : orderData ? (
//<div className="space-y-4">
//{/*Отображение основных данных заказа с использованием TextInput */}
//<TextInput
//label="Маршрут"
//value={`${orderData.departurePoint} → ${orderData.arrivalPoint}`}
//onChange={noop}
//readOnly
//disabled
//placeholder="Маршрут"
//required={false}
//requiredStar={false}
//type="text"
//error={false}
//errorBorder={false}
//validationMessage=""
///>
//
//<TextInput
//label="Тариф"
//value={`${orderData.tariff?.name || ''} - ${orderData.tariff?.description || ''} (${orderData.tariff?.price || 0} сом)`}
//onChange={noop}
//readOnly
//disabled
//placeholder="Тариф"
//required={false}
//requiredStar={false}
//type="text"
//error={false}
//errorBorder={false}
//validationMessage=""
///>
//
//<TextInput
//label="Время отправления"
//value={orderData.departureTime}
//onChange={noop}
//readOnly
//disabled
//placeholder="Время отправления"
//required={false}
//requiredStar={false}
//type="date"
//error={false}
//errorBorder={false}
//validationMessage=""
///>
//
//<TextInput
//label="Ожидание (минут)"
//value={orderData.waitingTimeMinutes?.toString() || '0'}
//onChange={noop}
//readOnly
//disabled
//placeholder="Ожидание"
//required={false}
//requiredStar={false}
//type="number"
//error={false}
//errorBorder={false}
//validationMessage=""
///>
//
//{orderData.tariff?.tariffAdditionalServices?.length > 0 && (
//<div>
//<label className="block text-sm font-medium text-gray-500 mb-2">
//Дополнительные услуги
//</label>
//<ul className="list-disc ml-6">
//{orderData.tariff.tariffAdditionalServices.map((service: any) => (
//<li key={service.uuid}>
//{service.service?.name} — {service.price} сом
//</li>
//))}
//</ul>
//</div>
//)}
//</div>
//) : (
//<p>Нет данных для отображения.</p>
//)}
//</div>
//
//<div className="flex justify-between p-4">
//<button
//onClick={handlePrev}
//disabled={currentIndex === 0}
//className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//>
//Предыдущий
//</button>
//<button
//onClick={handleNext}
//disabled={currentIndex === notifications.length - 1}
//className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//>
//Следующий
//</button>
//</div>
//</div>
//</AnimatedComponent>
//</div>
//);
//};
//
//export default OrderInfoModal;
