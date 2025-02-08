import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { LazyImage } from '@shared/components/ui/images';
import { orderStatusOptions } from '@shared/lib/effector/orders/options-and-translation/optionsStatusOrder';

interface ModalContentProps {
  selectedStatus: string;
  selectedDeparturePoint: any;
  selectedArrivalPoint: any;
  selectedIntermediatePoints: any[];
  selectedTariff: any;
  departureTime: string | '';
  flightNumber: string;
  description: string;
  selectedClientInfo: any;
  selectedDriverInfo: any;
  freeWaitTime: number;
  waitingTimeMinutes: number;
  extraWaitingTimeCost: number;
  selectedAdditionalServices: any[];
  price: number;
}

const ModalContent: React.FC<ModalContentProps> = ({
  selectedStatus,
  selectedDeparturePoint,
  selectedArrivalPoint,
  selectedIntermediatePoints,
  selectedTariff,
  departureTime,
  flightNumber,
  description,
  selectedClientInfo,
  selectedDriverInfo,
  freeWaitTime,
  waitingTimeMinutes,
  extraWaitingTimeCost,
  selectedAdditionalServices,
  price,
}) => {
  const orderDetails_client = [
    {
      title: '',
      items: [
        {
          label: 'Статус заказа',
          value: orderStatusOptions.find((option) => option.value === selectedStatus)?.label,
        },
      ],
    },
    {
      title: 'Информация о клиенте',
      items: [
        {
          label: 'Клиент',
          value: selectedClientInfo ? selectedClientInfo.fullName : 'Не выбран',
        },
        {
          label: 'Телефон',
          value: selectedClientInfo ? selectedClientInfo.phone : 'Не указан',
        },
      ],
    },
  ];

  const stops = [
    {
      title: 'Промежуточные точки',
      items:
        selectedIntermediatePoints.length > 0
          ? selectedIntermediatePoints.map((point, index) => ({
              label: `Промежуточная точка ${index + 1}`,
              value: point ? point.address : 'Не выбрано',
            }))
          : [{ label: 'Промежуточные точки', value: 'Не выбраны' }],
    },
  ];

  const orderDetails_order = [
    {
      items: [
        {
          label: 'Номер рейса',
          value: flightNumber || 'Не указан',
        },
        {
          label: 'Описание',
          value: description || 'Не указан',
        },
      ],
    },
    {
      title: 'Информация о водителе',
      items: [
        {
          label: 'Водитель',
          value: selectedDriverInfo ? selectedDriverInfo.fullName : 'Не выбран',
        },
        {
          label: 'Тип авто',
          value: selectedDriverInfo?.vehicleDriver?.vehicle?.vehicleType || 'Не указан',
        },
        {
          label: 'Уровень сервиса',
          value: selectedDriverInfo?.vehicleDriver?.vehicle?.serviceLevels || 'Не указан',
        },
      ],
    },
    {
      title: 'Время ожидания',
      items: [
        {
          label: 'Бесплатное время ожидания',
          value: freeWaitTime ? `${freeWaitTime} минут` : 'Не указано',
        },
        {
          label: 'Время ожидания',
          value: waitingTimeMinutes ? `${waitingTimeMinutes} минут` : 'Не указано',
        },
        {
          label: 'Стоимость ожидания',
          value: extraWaitingTimeCost ? `${extraWaitingTimeCost} сом` : 'Не указано',
        },
      ],
    },
  ];

  const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="bg-white rounded-md w-full flex flex-col">
      <span className="block text-gray-500 font-extrabold mr-2 mb-2">{label}:</span>
      <span className="px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full">
        {value}
      </span>
    </div>
  );

  return (
    <>
      <div>
        {orderDetails_client.map((item, index) => (
          <div key={index} className="w-full flex flex-col mb-4">
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <div className="flex w-full gap-4">
              {item.items.map((subItem, itemIndex) => (
                <DetailItem key={itemIndex} label={subItem.label} value={subItem.value} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Информация о маршруте</h3>
        <div className="gap-[7px] border border-gray-300 rounded-md flex items-center p-[24px]">
          <LazyImage src="/icon_path.svg" alt="iconPath" className="w-[10px] h-[72px] mt-[24px]" />
          <div className="flex flex-col w-full">
            <p className="ml-[9px]">
              <span className="block text-gray-500 font-extrabold mr-2">Адрес подачи</span>{' '}
              {selectedDeparturePoint ? selectedDeparturePoint.address : 'Не выбрано'}
            </p>
            <span className="border-b border-gray-300 my-2"></span>
            <p className="ml-[9px]">
              <span className="block text-gray-500 font-extrabold mr-2">Адрес прибытия</span>{' '}
              {selectedArrivalPoint ? selectedArrivalPoint.address : 'Не выбрано'}
            </p>
          </div>
        </div>
      </div>
      <div className="mb-4">
        {stops.map((item, index) => (
          <div key={index} className="w-full flex flex-col mb-4">
            <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
            <div className="flex w-full gap-4">
              {item.items.map((subItem, itemIndex) => (
                <DetailItem key={itemIndex} label={subItem.label} value={subItem.value} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Информация о заказе</h3>
          <div className="w-full flex gap-4">
            <div className="mb-1 w-full">
              <span className="block text-gray-500 font-extrabold mr-2 mb-2">Тариф:</span>{' '}
              <div className="px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full">
                {selectedTariff
                  ? `${selectedTariff.vehicleType} - ${selectedTariff.serviceLevel}`
                  : 'Не выбран'}
              </div>
            </div>
            <div className="mb-1 w-full">
              <span className="block text-gray-500 font-extrabold mr-2 mb-2">
                Время отправления:
              </span>{' '}
              <div className="px-3 py-2 font-medium text-[#2A3037] rounded-md border border-gray-300 w-full flex items-center gap-1">
                <LazyImage src="/calendar.svg" alt="calendar-icon" className="w-[24px] h-[20px]" />
                {departureTime
                  ? format(new Date(departureTime), 'dd MMMM yyyy HH:mm', { locale: ru })
                  : 'Не выбрано'}
              </div>
            </div>
          </div>

          {orderDetails_order.map((item, index) => (
            <div key={index} className="w-full flex flex-col mb-4">
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <div className="grid grid-cols-2 w-full gap-4">
                {item.items.map((item, itemIndex) => (
                  <DetailItem key={itemIndex} label={item.label} value={item.value} />
                ))}
              </div>
            </div>
          ))}
        </div>
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
        <div className="mt-4 flex justify-end">
          <h3 className="text-gray-500 font-extrabold ">
            Сумма: <span className="text-xl font-bold mb-2 text-gray-700">{price}с</span>
          </h3>
        </div>
      </div>
    </>
  );
};

export default ModalContent;
