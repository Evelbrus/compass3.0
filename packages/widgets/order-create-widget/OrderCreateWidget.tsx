'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { IButton } from '@shared/components/ui/buttons';
import { TextInput } from '@shared/components/ui/inputs';
import { showToast } from '@shared/components/toast/ToastManager';
import { Point } from '@prisma/client';
import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ExtendedDriver,
  ExtendedUser,
  SelectedAdditionalService,
} from '@features/orders/create/hooks';
import { CloseIcon } from '@shared/components/ui/icon';
import { OrderStatus } from '@prisma/client';
import { orderStatusOptions } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';

//Определяем тип для OrderStatus на основе orderStatusOptions
type OrderStatusType = (typeof orderStatusOptions)[number]['value'];

interface OrderCreateWidgetProps {
  onSubmit: (data: CreateOrderData) => void;
  handleUpdatePrice: () => void;
  price: number;
  selectedDeparturePoint: Point | null;
  selectedArrivalPoint: Point | null;
  selectedIntermediatePoints: (Point | null)[];
  selectedTariff: ExtendedTariff | null;
  selectedClientInfo: ExtendedUser | null;
  selectedDriverInfo: ExtendedDriver | null;
  freeWaitTime: number | undefined;
  waitingTimeMinutes: number;
  extraWaitingTimeCost: number;
  selectedAdditionalServices: SelectedAdditionalService[];
  isEditingProp: boolean; //Renamed to isEditingProp to avoid confusion
}

const OrderCreateWidget: React.FC<OrderCreateWidgetProps> = ({
  onSubmit,
  handleUpdatePrice,
  price,
  selectedDeparturePoint,
  selectedArrivalPoint,
  selectedIntermediatePoints,
  selectedTariff,
  selectedClientInfo,
  selectedDriverInfo,
  freeWaitTime,
  waitingTimeMinutes,
  extraWaitingTimeCost,
  selectedAdditionalServices,
  isEditingProp, //Get isEditing from props
}) => {
  const { setValue, handleSubmit, formState, trigger, watch } = useFormContext<CreateOrderData>();
  const [editedPrice, setEditedPrice] = useState<number | null>(null);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusType>(
    orderStatusOptions[0].value,
  );
  const [isEditingLocal, setIsEditingLocal] = useState(false);

  const calculatedPrice = price || 0;

  const departureTime = watch('departureTime');
  const flightNumber = watch('flightNumber');
  const description = watch('description');

  useEffect(() => {
    if (!isEditingLocal) {
      setEditedPrice(null);
    }
  }, [isEditingLocal]);

  const handleEditClick = () => {
    setEditedPrice(calculatedPrice);
    setIsEditingLocal(true);
  };

  const handleReturnToCalculatedPrice = () => {
    setEditedPrice(null);
    setValue('basePrice', calculatedPrice);
    setIsEditingLocal(false);
    handleUpdatePrice();
  };

  const handlePriceChange = (value: string) => {
    const newPrice = Number(value);
    setEditedPrice(newPrice);
    setValue('basePrice', newPrice);
  };

  const handleUpdatePriceClick = useCallback(() => {
    if (isEditingLocal) {
      return;
    }
    setIsUpdatingPrice(true);
    handleUpdatePrice();
    showToast.success('Цена обновлена');
    setTimeout(() => {
      setIsUpdatingPrice(false);
    }, 1000);
  }, [handleUpdatePrice, isEditingLocal]);

  const handleOpenModal = async () => {
    const isValid = await trigger();
    if (!isValid) {
      showToast.error('Пожалуйста, заполните все обязательные поля.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateOrder = () => {
    handleSubmit((data) => {
      console.log('Data before sending:', data);
      const orderData = {
        ...data,
        basePrice: Number(data.basePrice),
        status: selectedStatus as OrderStatus, //Pass selected status
      };
      console.log('Order data before onSubmit:', orderData);
      onSubmit(orderData);
      setIsModalOpen(false);
    })();
  };

  console.log('base', price);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleOpenModal();
        }}
        className="flex flex-col items-end gap-4 p-4 border rounded-md bg-white"
      >
        {/*Select for order status - перемещен сюда */}
        {isEditingProp && (
          <div className="flex flex-col items-end gap-2 w-full">
            <label className="text-sm">Статус заказа</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as OrderStatusType)}
              className="border rounded p-2 w-full"
            >
              {orderStatusOptions.map((statusOption) => (
                <option key={statusOption.value} value={statusOption.value}>
                  {statusOption.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className={'flex flex-col items-end gap-2'}>
          <span>Итоговая сумма заказа:</span>
          <div className={'flex flex-row gap-2'}>
            <TextInput
              type="number"
              value={String(
                isEditingLocal
                  ? editedPrice !== null
                    ? editedPrice
                    : calculatedPrice
                  : calculatedPrice,
              )}
              readOnly={!isEditingLocal}
              onChange={handlePriceChange}
              classNamePlaceholder={'text-4'}
              className={'w-[300px]'}
              classNamePadding={'p-2'}
              ref={inputRef}
            />
            {!isEditingLocal && (
              <IButton
                onClick={handleUpdatePriceClick}
                disabled={isUpdatingPrice}
                className={`bg-gray-400 rounded-md p-2 text-white flex items-center justify-center min-w-[40px] ${
                  isUpdatingPrice ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div
                  className={`rounded-full h-4 w-4 border-t-2 border-b-2 border-white ${
                    isUpdatingPrice ? 'animate-spin' : ''
                  }`}
                ></div>
              </IButton>
            )}
          </div>
          <div className={'w-full flex flex-row justify-end gap-2'}>
            {!isEditingLocal && (
              <IButton
                onClick={handleEditClick}
                className={'bg-[#001659] rounded-md p-2 text-white'}
              >
                Редактировать
              </IButton>
            )}
            {isEditingLocal && (
              <IButton
                onClick={handleReturnToCalculatedPrice}
                className={'bg-green-600 rounded-md p-2 text-white'}
              >
                Вернуться к рассчитанной цене
              </IButton>
            )}
          </div>
        </div>
        {formState.errors.basePrice?.message && (
          <span className="text-red-500">{formState.errors.basePrice.message}</span>
        )}
        <IButton
          type="submit"
          onClick={handleUpdatePriceClick}
          className={'w-[371px] ' + 'bg-[#2A3037] text-white rounded-md p-4'}
        >
          Продолжить
        </IButton>
      </form>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-md w-[800px] flex flex-col p-12 max-h-[90vh] overflow-y-auto relative">
            {' '}
            {/*Added relative positioning */}
            <IButton
              variant="close"
              onClick={handleCloseModal}
              aria-label="Закрыть модальное окно"
              className="absolute top-2 right-2 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full"
            >
              <CloseIcon />
            </IButton>
            <h2 className="text-2xl font-bold mb-4 text-center">Подтверждение заказа</h2>
            {/*Display only the status in the modal */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Статус заказа</h3>
              <p>{orderStatusOptions.find((option) => option.value === selectedStatus)?.label}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Информация о маршруте</h3>
              <div className="flex gap-4">
                <p className="mb-1">
                  <span className="font-medium">Отправление:</span>{' '}
                  {selectedDeparturePoint ? selectedDeparturePoint.address : 'Не выбрано'}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Прибытие:</span>{' '}
                  {selectedArrivalPoint ? selectedArrivalPoint.address : 'Не выбрано'}
                </p>
              </div>

              {selectedIntermediatePoints.length > 0 && (
                <>
                  <h4 className="text-md font-semibold mt-2 mb-1">Промежуточные точки:</h4>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left">
                        <th className="py-2 px-4 font-semibold text-gray-700">#</th>
                        <th className="py-2 px-4 font-semibold text-gray-700">Адрес</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedIntermediatePoints.map((point, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-2 px-4">{index + 1}</td>
                          <td className="py-2 px-4">{point ? point.address : 'Не выбрано'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
            <div className="mb-4 flex gap-4">
              <div className="w-1/2">
                <h3 className="text-lg font-semibold mb-2">Информация о заказе</h3>
                <p className="mb-1">
                  <span className="font-medium">Тариф:</span>{' '}
                  {selectedTariff
                    ? `${selectedTariff.vehicleType} - ${selectedTariff.serviceLevel}`
                    : 'Не выбран'}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Время отправления:</span>{' '}
                  {departureTime
                    ? format(new Date(departureTime), 'dd MMMM yyyy HH:mm', { locale: ru })
                    : 'Не выбрано'}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Номер рейса:</span> {flightNumber || 'Не указан'}
                </p>
                {description && (
                  <p className="mb-1">
                    <span className="font-medium">Описание:</span> {description}
                  </p>
                )}
              </div>

              <div className="w-1/2">
                <h3 className="text-lg font-semibold mb-2">Информация о клиенте</h3>
                <p className="mb-1">
                  <span className="font-medium">Клиент:</span>{' '}
                  {selectedClientInfo ? selectedClientInfo.fullName : 'Не выбран'}
                </p>
                {selectedClientInfo && (
                  <p className="mb-1">
                    <span className="font-medium">Телефон:</span> {selectedClientInfo.phone}
                  </p>
                )}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Информация о водителе</h3>
              <p className="mb-1">
                <span className="font-medium">Водитель:</span>{' '}
                {selectedDriverInfo ? selectedDriverInfo.fullName : 'Не выбран'}
              </p>
              {selectedDriverInfo && selectedDriverInfo.vehicleDriver && (
                <>
                  <p className="mb-1">
                    <span className="font-medium">Тип авто:</span>{' '}
                    {selectedDriverInfo.vehicleDriver.vehicle.vehicleType}
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Уровень сервиса:</span>{' '}
                    {selectedDriverInfo.vehicleDriver.vehicle.serviceLevels}
                  </p>
                </>
              )}
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Время ожидания</h3>
              <p className="mb-1">
                <span className="font-medium">Бесплатное время ожидания:</span> {freeWaitTime} минут
              </p>
              <p className="mb-1">
                <span className="font-medium">Время ожидания:</span> {waitingTimeMinutes} минут
              </p>
              <p className="mb-1">
                <span className="font-medium">Стоимость ожидания:</span> {extraWaitingTimeCost} сом
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Дополнительные услуги</h3>
              {selectedAdditionalServices.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="py-2 px-4 font-semibold text-gray-700">Услуга</th>
                      <th className="py-2 px-4 font-semibold text-gray-700">Цена</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAdditionalServices.map((service) => (
                      <tr key={service.uuid} className="border-b border-gray-200">
                        <td className="py-2 px-4">{service.name}</td>
                        <td className="py-2 px-4">{service.price} сом</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>Нет дополнительных услуг</p>
              )}
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Итоговая сумма: {price} сом</h3>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <IButton onClick={handleCloseModal} className={'bg-gray-300 p-2'}>
                Вернуться
              </IButton>
              <IButton onClick={handleCreateOrder} className={'bg-blue-500 text-white p-2'}>
                Создать заказ
              </IButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderCreateWidget;
