import React, { useEffect, useState } from 'react';
import { useUnit } from 'effector-react';
import { CloseIcon } from 'next/dist/client/components/react-dev-overlay/internal/icons/CloseIcon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import OrderDetailDriverModalSkeleton from '@widgets/modal/order-detail-driver-modal/OrderDetailDriverModalSkeleton';
import { $orderUuid, closeModal } from '@shared/lib/effector';
import { orderStatusOptions } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { IButton } from '@shared/components/ui/buttons';
import { LazyImage } from '@shared/components/ui/images';

interface TariffOnService {
  name: string;
  price: number;
}

interface OrderTariffAdditionalService {
  uuid: string;
  tariffOnService?: TariffOnService;
}

const OrderDetailDriverModal = () => {
  const orderUuid = useUnit($orderUuid);
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (orderUuid) {
        setLoading(true);
        try {
          const response = await fetch(`/api/drivers/orders/${orderUuid}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch order details: ${response.status}`);
          }
          const data = await response.json();
          setOrderData(data);
          setError(null);
        } catch (error) {
          console.error('Error fetching order details:', error);
          setError(error instanceof Error ? error.message : 'Failed to fetch order details');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrderData();
  }, [orderUuid]);

  const closeModalHandler = () => {
    closeModal();
  };

  if (!orderUuid) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <AnimatedComponent
          duration={500}
          className={'w-[580px] h-full max-h-[800px] flex justify-center'}
        >
          {' '}
          <div className="bg-white rounded-3xl p-8">
            <p>No order selected.</p>
            <IButton onClick={closeModalHandler}>Close</IButton>
          </div>
        </AnimatedComponent>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <AnimatedComponent
          duration={500}
          className={'w-[580px] h-full max-h-[800px] flex justify-center'}
        >
          {' '}
          <div className="bg-white rounded-3xl p-8 w-full max-w-3xl">
            <OrderDetailDriverModalSkeleton />
          </div>
        </AnimatedComponent>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <AnimatedComponent
          duration={500}
          className={'w-[580px] h-full max-h-[800px] flex justify-center'}
        >
          {' '}
          <div className="bg-white rounded-3xl p-8 w-full max-w-3xl h-[600px]">
            <p>Error: {error}</p>
            <IButton onClick={closeModalHandler}>Close</IButton>
          </div>
        </AnimatedComponent>
      </div>
    );
  }

  const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="bg-white rounded-md w-full flex flex-col">
      <span className="block text-gray-500 font-extrabold mr-2 mb-2">{label}:</span>
      <span className="px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full">
        {value}
      </span>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <AnimatedComponent
        duration={500}
        className={'w-[580px] h-full max-h-[800px] flex justify-center'}
      >
        <div className="bg-white rounded-3xl p-8 relative w-full max-w-3xl overflow-auto">
          <IButton
            variant="close"
            onClick={closeModalHandler}
            aria-label="Закрыть модальное окно"
            className="absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2"
          >
            <CloseIcon />
          </IButton>
          <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
          <h3 className="text-lg font-semibold mb-2">Информация о заказе</h3>
          <div className="w-full flex flex-col mb-4 gap-4">
            <DetailItem
              label="Статус заказа"
              value={
                orderData.status
                  ? orderStatusOptions.find((option) => option.value === orderData.status)?.label
                  : 'Не указан'
              }
            />
            <div className="flex w-full gap-4">
              <DetailItem
                label="Клиент"
                value={orderData.clientBy ? orderData.clientBy.fullName : 'Не указан'}
              />
              <DetailItem
                label="Телефон"
                value={orderData.clientBy ? orderData.clientBy.phone : 'Не указан'}
              />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Информация о маршруте</h3>
            <div className="gap-[7px] border border-gray-300 rounded-md flex items-center p-[24px]">
              <LazyImage
                src="/icon_path.svg"
                alt="iconPath"
                className="w-[10px] h-[72px] mt-[24px]"
              />
              <div className="flex flex-col w-full">
                <p className="ml-[9px]">
                  <span className="block text-gray-500 font-extrabold mr-2">Адрес подачи</span>{' '}
                  {orderData.departurePoint ? orderData.departurePoint.address : 'Не указано'}
                </p>
                <span className="border-b border-gray-300 my-2"></span>
                <p className="ml-[9px]">
                  <span className="block text-gray-500 font-extrabold mr-2">Адрес прибытия</span>{' '}
                  {orderData.arrivalPoint ? orderData.arrivalPoint.address : 'Не указано'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Информация о заказе</h3>
            <div className="w-full flex gap-4">
              <div className="mb-1 w-full">
                <span className="block text-gray-500 font-extrabold mr-2 mb-2">Тариф:</span>
                <div className="px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full">
                  {orderData.tariff
                    ? `${orderData.tariff.vehicleTypes} - ${orderData.tariff.name}`
                    : 'Не указано'}
                </div>
              </div>
              <div className="mb-1 w-full">
                <span className="block text-gray-500 font-extrabold mr-2 mb-2">
                  Время отправления:
                </span>
                <div className="px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full flex items-center gap-1">
                  <LazyImage
                    src="/calendar.svg"
                    alt="calendar-icon"
                    className="w-[24px] h-[20px]"
                  />
                  {orderData.departureTime
                    ? format(new Date(orderData.departureTime), 'dd MMMM yyyy HH:mm', {
                        locale: ru,
                      })
                    : 'Не указано'}
                </div>
              </div>
            </div>
            <div className="w-full flex gap-4">
              <DetailItem label="Номер рейса" value={orderData.flightNumber || 'Не указано'} />
              <DetailItem label="Описание" value={orderData.description || 'Не указано'} />
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Дополнительные услуги</h3>
            {orderData.orderTariffAdditionalServices &&
            orderData.orderTariffAdditionalServices.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="py-2 px-4 font-semibold text-gray-700">Услуга</th>
                    <th className="py-2 px-4 font-semibold text-gray-700">Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {orderData.orderTariffAdditionalServices.map(
                    (service: OrderTariffAdditionalService) => (
                      <tr key={service.uuid} className="border-b border-gray-200">
                        <td className="py-2 px-4">{service.tariffOnService?.name || 'N/A'}</td>
                        <td className="py-2 px-4">{service.tariffOnService?.price || 0} сом</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            ) : (
              <p>Нет дополнительных услуг</p>
            )}
            <div className="mt-4 flex justify-end">
              <h3 className="text-gray-500 font-extrabold ">
                Сумма:{' '}
                <span className="text-xl font-bold mb-2 text-gray-700">{orderData.basePrice}с</span>
              </h3>
            </div>
          </div>
          <div className={'w-full flex justify-end'}>
            <IButton onClick={closeModalHandler}>Close</IButton>
          </div>
        </div>
      </AnimatedComponent>
    </div>
  );
};

export default OrderDetailDriverModal;
