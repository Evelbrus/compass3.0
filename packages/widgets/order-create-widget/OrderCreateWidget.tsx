'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { CreateOrderData } from '@shared/prisma/interface/orders/interface';
import { IButton } from '@shared/components/ui/buttons';
import { TextInput } from '@shared/components/ui/inputs';
import { showToast } from '@shared/components/toast/ToastManager';
import { Point } from '@prisma/client';
import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import {
  ExtendedDriver,
  ExtendedUser,
  SelectedAdditionalService,
} from '@features/orders/create/hooks';
import { CloseIcon } from '@shared/components/ui/icon';
import { OrderStatus } from '@prisma/client';
import { orderStatusOptions } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';
import ModalContent from './order-info-modal/OrderInfo';

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
  isEditingProp: boolean;
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
  isEditingProp,
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

  const handlePriceChange = (value: string | number) => {
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
        status: selectedStatus as OrderStatus,
      };
      console.log('Order data before onSubmit:', orderData);
      onSubmit(orderData);
      setIsModalOpen(false);
    })();
  };

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
            <ModalContent
              selectedStatus={selectedStatus}
              selectedDeparturePoint={selectedDeparturePoint}
              selectedArrivalPoint={selectedArrivalPoint}
              selectedIntermediatePoints={selectedIntermediatePoints}
              selectedTariff={selectedTariff}
              departureTime={departureTime ?? ''}
              flightNumber={flightNumber ?? ''}
              description={description ?? ''}
              selectedClientInfo={selectedClientInfo}
              selectedDriverInfo={selectedDriverInfo}
              freeWaitTime={freeWaitTime ?? 0}
              waitingTimeMinutes={waitingTimeMinutes}
              extraWaitingTimeCost={extraWaitingTimeCost}
              selectedAdditionalServices={selectedAdditionalServices}
              price={price}
            />
            <div className="flex justify-end gap-4 mt-4">
              <IButton
                onClick={handleCloseModal}
                className={
                  'p-3 bg-gray-500 opacity-50 text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition'
                }
              >
                Вернуться
              </IButton>
              <IButton
                onClick={handleCreateOrder}
                className={
                  'p-3 bg-[color:var(--button-secondary)] text-[color:var(--text-white)] rounded-lg hover:bg-[color:var(--button-secondary-hover)] transition'
                }
              >
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
