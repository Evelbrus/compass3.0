import React, { useState, useCallback } from 'react';
import { FormProvider } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from '@shared/components/ui/icon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { Decimal } from 'decimal.js';

//Типизация
import { Point, ServiceLevels, VehicleType } from '@prisma/client';
import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';

//Хуки
import useTariffs from '@shared/components/modal/create-client-corp-order/hooks/tariff/useTariffs';
import usePointSelector from '@shared/components/modal/create-client-corp-order/hooks/point/usePointSelector';
import useCreateClientCorpOrderLogic, {
  CreateClientCorpOrderData,
} from '@shared/components/modal/create-client-corp-order/hooks/useCreateClientCorpOrder';
import useAdditionalServices from '@shared/components/modal/create-client-corp-order/hooks/additional-service/useAdditionalServices';
import useWaitTime from '@shared/components/modal/create-client-corp-order/hooks/wait/useWaitTime';
import useTotalPrice from '@shared/components/modal/create-client-corp-order/hooks/price/useTotalPrice';
import useSubmitOrder from '@shared/components/modal/create-client-corp-order/hooks/useSubmitOrder';
import useClientNotifications from '@shared/components/modal/create-client-corp-order/hooks/notifications/useClientNotifications';

//Компоненты
import TariffCheckbox from '@shared/components/modal/create-client-corp-order/ui/TariffCheckbox';
import PointSelector from '@shared/components/modal/create-client-corp-order/inputs/PointSelector';
import AdditionalPoints from '@shared/components/modal/create-client-corp-order/ui/AdditionalPoints';
import AdditionalServicesList from '@shared/components/modal/create-client-corp-order/ui/AdditionalServicesList';
import FlightDetails from '@shared/components/modal/create-client-corp-order/ui/FlightDetails';
import usePointSelectionHandlers from '@shared/components/modal/create-client-corp-order/hooks/point/usePointSelectionHandlers';
import WaitTimeSelector from '@shared/components/modal/create-client-corp-order/ui/WaitTimeSelector';
import { showToast } from '@shared/components/toast/ToastManager';
import { useRouter } from 'next/navigation';

interface CreateClientCorpOrderProps {
  onClose: () => void;
}

const CreateClientCorpOrder: React.FC<CreateClientCorpOrderProps> = ({ onClose }) => {
  const router = useRouter();

  const [orderId, setOrderId] = useState<string>('');
  const [ServiceLevel, setServiceLevel] = useState<ServiceLevels>();
  const [VehicleType, setVehicleType] = useState<VehicleType>();

  const tariffAndServices = useTariffs({
    vehicleType: VehicleType,
  });
  const tariffs: ExtendedTariff[] = tariffAndServices.tariffs || [];

  const {
    selectedServiceLevel,
    selectedVehicleType,
    selectedTariff,
    handleServiceLevelChange,
    handleVehicleTypeChange,
    formMethods,
  } = useCreateClientCorpOrderLogic(tariffs, ServiceLevel, VehicleType);

  //Селектор для адреса подачи (departure)
  const {
    isOpen: isFromOpen,
    searchValue: fromSearchValue,
    search: fromSearch,
    filteredPoints: fromFilteredPoints,
    loading: fromLoading,
    onOpenSelect: onFromOpenSelect,
    onSearchValueChange: onFromSearchValueChange,
    handleSearchChange: handleFromSearchChange,
    onSelectPoint: onFromSelectPoint,
    selectorRef: fromSelectorRef,
    observerRef: fromObserverRef,
    selectedPoint: departurePoint,
  } = usePointSelector({ mode: 'single' });

  //Селектор для адреса прибытия (arrival)
  const {
    isOpen: isToOpen,
    searchValue: toSearchValue,
    search: toSearch,
    filteredPoints: toFilteredPoints,
    loading: toLoading,
    onOpenSelect: onToOpenSelect,
    onSearchValueChange: onToSearchValueChange,
    handleSearchChange: handleToSearchChange,
    onSelectPoint: onToSelectPoint,
    selectorRef: toSelectorRef,
    observerRef: toObserverRef,
    selectedPoint: arrivalPoint,
  } = usePointSelector({ mode: 'single' });

  //Селектор для дополнительных остановок (multiple)
  const {
    isOpen: isAdditionalOpen,
    searchValue: additionalSearchValue,
    search: additionalSearch,
    filteredPoints: additionalFilteredPoints,
    loading: additionalLoading,
    onOpenSelect: onAdditionalOpenSelect,
    onSearchValueChange: onAdditionalSearchValueChange,
    handleSearchChange: onAdditionalHandleSearchChange,
    onSelectPoint: onAdditionalSelectPoint,
    selectorRef: additionalSelectorRef,
    observerRef: additionalObserverRef,
    selectedPoints: additionalPoints,
    onRemovePoint,
    onChangeOrder,
    totalAdditionalPrice,
  } = usePointSelector({
    mode: 'multiple',
    initialSelectedPoints: Array(5).fill(null),
    additionalPointPrice: selectedTariff?.additionalPointPrice,
  });

  const {
    availableServices,
    handleServiceSelection,
    selectedServices,
    totalAdditionalServicesPrice,
  } = useAdditionalServices(selectedTariff);

  const { isPointAlreadySelected, routeCost } = usePointSelectionHandlers({
    departurePoint: departurePoint ?? undefined,
    arrivalPoint: arrivalPoint ?? undefined,
    additionalPoints: additionalPoints ?? [],
  });

  const handleDepartureSelectPoint = useCallback(
    (point: Point) => {
      if (isPointAlreadySelected(point, 'departure')) {
        alert('Этот город уже выбран в другом селекторе');
        return;
      }
      onFromSelectPoint(point);
    },
    [isPointAlreadySelected, onFromSelectPoint],
  );

  const handleArrivalSelectPoint = useCallback(
    (point: Point) => {
      if (isPointAlreadySelected(point, 'arrival')) {
        alert('Этот город уже выбран в другом селекторе');
        return;
      }
      onToSelectPoint(point);
    },
    [isPointAlreadySelected, onToSelectPoint],
  );

  const handleAdditionalSelectPoint = useCallback(
    (point: Point, index: number) => {
      if (isPointAlreadySelected(point, 'additional', index)) {
        alert('Этот город уже выбран в другом селекторе');
        return;
      }
      onAdditionalSelectPoint(point, index);
    },
    [isPointAlreadySelected, onAdditionalSelectPoint],
  );

  const { waitTime, additionalWaitTimeCost, adjustWaitTime, minWaitTime, maxWaitTime } =
    useWaitTime({ selectedTariff, departurePoint });

  //Обновляем расчет стоимости, учитывая расстояние между точками
  const totalPrice = useTotalPrice({
    tariffPrice: selectedTariff?.price ? new Decimal(selectedTariff.price) : null,
    additionalServicesPrice: totalAdditionalServicesPrice
      ? new Decimal(totalAdditionalServicesPrice)
      : null,
    additionalPointsPrice: totalAdditionalPrice ? new Decimal(totalAdditionalPrice) : null,
    waitTimeCost: additionalWaitTimeCost ? new Decimal(additionalWaitTimeCost) : null,
    routeCost: routeCost ? new Decimal(routeCost) : null,
  });

  const { handleOrderSuccess, handleOrderError } = useClientNotifications({
    departurePoint,
    arrivalPoint,
    orderId,
  });

  const { submitOrder, isSubmitting, error } = useSubmitOrder();

  const onSubmit = async (formData: CreateClientCorpOrderData) => {
    try {
      //Передаём все необходимые данные в submitOrder
      const result = await submitOrder({
        selectedTariff,
        departurePoint: departurePoint?.uuid ?? '',
        arrivalPoint: arrivalPoint?.uuid ?? '',
        additionalPoints: additionalPoints
          ?.map((point) => point?.uuid)
          .filter((uuid): uuid is string => Boolean(uuid)),
        selectedServices,
        totalPrice: totalPrice.toNumber(),
        departureTime: formData.departureTime,
        flightNumber: formData.flightNumber || '',
        description: formData.description || '',
        waitingTimeMinutes: waitTime,
      });

      if (result && result.uuid) {
        setOrderId(result.uuid);
      } else {
        throw new Error('Не удалось получить uuid заказа из ответа сервера');
      }

      showToast.success('Заказ создан успешно!');
      handleOrderSuccess();
      router.push('/orders');
      onClose();
    } catch (err) {
      handleOrderError(err);
    }
  };

  if (tariffAndServices.isInitialMount) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <AnimatedComponent duration={500} className="bg-white rounded-3xl p-8 w-full max-w-3xl">
          <div>Загрузка...</div>
        </AnimatedComponent>
      </div>
    );
  }

  if (tariffAndServices.error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <AnimatedComponent duration={500} className="bg-white rounded-3xl p-8 w-full max-w-3xl">
          <div>Ошибка: {tariffAndServices.error}</div>
          <IButton onClick={onClose}>Закрыть</IButton>
        </AnimatedComponent>
      </div>
    );
  }

  return (
    <FormProvider {...formMethods}>
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
        <AnimatedComponent
          duration={500}
          className="relative flex flex-col bg-white rounded-3xl p-8 w-full h-full max-w-3xl gap-4 overflow-y-auto"
        >
          <IButton
            variant="close"
            onClick={onClose}
            aria-label="Закрыть модальное окно"
            className="absolute top-4 right-4 border border-gray-200 hover:shadow-[0px_0px_5px_rgba(0,0,0,0.15)] hover:bg-blue-100 rounded-full p-2"
          >
            <CloseIcon />
          </IButton>

          {/*Оборачиваем контент в форму и добавляем обработчик onSubmit */}
          <form className="flex flex-col gap-4" onSubmit={formMethods.handleSubmit(onSubmit)}>
            <h2 className="text-3xl font-semibold">Создание заказа</h2>

            <div className="flex border"></div>

            <h2 className="text-2xl font-semibold">
              1. Выберите тариф
              <br />
              (тип авто и уровень обслуживания)
            </h2>

            <TariffCheckbox
              tariffs={tariffs}
              selectedServiceLevel={selectedServiceLevel}
              selectedVehicleType={selectedVehicleType}
              selectedTariffUuid={selectedTariff?.uuid || null}
              handleServiceLevelChange={handleServiceLevelChange}
              handleVehicleTypeChange={handleVehicleTypeChange}
              {...formMethods}
            />

            <div className="w-[50%] flex border"></div>

            <h2 className="text-2xl font-semibold">2. Выберите адрес подачи</h2>

            <div className="flex flex-row gap-4">
              <div className="w-full flex flex-col gap-4 p-4 border-2 rounded-md">
                <PointSelector
                  control={formMethods.control}
                  name="departurePoint"
                  label="Адрес подачи"
                  isOpen={isFromOpen}
                  searchValue={fromSearchValue}
                  onOpenSelect={onFromOpenSelect}
                  onSearchValueChange={onFromSearchValueChange}
                  search={fromSearch}
                  handleSearchChange={handleFromSearchChange}
                  filteredPoints={fromFilteredPoints.map((point) => ({
                    ...point,
                    pricePerKm: new Decimal(point.pricePerKm),
                  }))}
                  loading={fromLoading}
                  onSelectPoint={handleDepartureSelectPoint}
                  selectorRef={fromSelectorRef}
                  observerRef={fromObserverRef}
                  selectedPoint={
                    departurePoint
                      ? { ...departurePoint, pricePerKm: new Decimal(departurePoint.pricePerKm) }
                      : null
                  }
                />
                <PointSelector
                  control={formMethods.control}
                  name="arrivalPoint"
                  label="Адрес прибытия"
                  isOpen={isToOpen}
                  searchValue={toSearchValue}
                  onOpenSelect={onToOpenSelect}
                  onSearchValueChange={onToSearchValueChange}
                  search={toSearch}
                  handleSearchChange={handleToSearchChange}
                  filteredPoints={toFilteredPoints.map((point) => ({
                    ...point,
                    pricePerKm: new Decimal(point.pricePerKm),
                  }))}
                  loading={toLoading}
                  onSelectPoint={handleArrivalSelectPoint}
                  selectorRef={toSelectorRef}
                  observerRef={toObserverRef}
                  selectedPoint={
                    arrivalPoint
                      ? { ...arrivalPoint, pricePerKm: new Decimal(arrivalPoint.pricePerKm) }
                      : null
                  }
                  arrivalPointPrice={arrivalPoint?.pricePerKm || undefined}
                />
              </div>

              <AdditionalPoints
                label="Дополнительные остановки"
                isOpen={isAdditionalOpen}
                searchValue={additionalSearchValue}
                onOpenSelect={onAdditionalOpenSelect}
                onSearchValueChange={onAdditionalSearchValueChange}
                search={additionalSearch}
                filteredPoints={additionalFilteredPoints.map((point) => ({
                  ...point,
                  pricePerKm: new Decimal(point.pricePerKm),
                }))}
                loading={additionalLoading}
                onSelectPoint={(point: Point, index?: number) =>
                  handleAdditionalSelectPoint(point, index ?? 0)
                }
                selectorRef={additionalSelectorRef}
                observerRef={additionalObserverRef}
                selectedPoints={
                  additionalPoints
                    ? additionalPoints.map((point) =>
                        point ? { ...point, pricePerKm: new Decimal(point.pricePerKm) } : null,
                      )
                    : []
                }
                onRemovePoint={onRemovePoint || (() => {})}
                onChangeOrder={onChangeOrder}
                handleSearchChange={onAdditionalHandleSearchChange}
                onMaxLimitReached={() => alert('Достигнут лимит дополнительных остановок')}
                totalAdditionalPrice={totalAdditionalPrice}
              />
            </div>

            <div className="flex border"></div>

            <h2 className="text-2xl font-semibold">
              3. Заполните описание и выберите
              <br />
              дополнительные опции
            </h2>

            <div className="flex flex-row gap-4">
              <div className="w-full flex flex-col gap-2">
                <FlightDetails {...formMethods} />
                <WaitTimeSelector
                  waitTime={waitTime}
                  additionalWaitTimeCost={additionalWaitTimeCost}
                  adjustWaitTime={adjustWaitTime}
                  minWaitTime={minWaitTime}
                  maxWaitTime={maxWaitTime}
                  departurePoint={departurePoint}
                  freeWaitTime={selectedTariff?.freeWaitTimeAirport ?? 0}
                />
              </div>
              <AdditionalServicesList
                label="Дополнительные опции"
                availableServices={availableServices}
                handleServiceSelection={handleServiceSelection}
                selectedServices={selectedServices}
                totalAdditionalServicesPrice={totalAdditionalServicesPrice}
              />
            </div>

            <div className="flex border"></div>

            <h2 className="text-2xl font-semibold">4. Общая цена</h2>
            <div>
              <h3>
                Общая сумма заказа: <span className={'font-bold'}>{totalPrice.toNumber()} сом</span>
              </h3>
            </div>

            {/*Кнопка для отправки формы */}
            <div className={'w-full flex justify-end'}>
              <IButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Отправка...' : 'Создать заказ'}
              </IButton>
            </div>
            {error && <p className="text-red-600 mt-2">Ошибка: {error}</p>}
          </form>
        </AnimatedComponent>
      </div>
    </FormProvider>
  );
};

export default CreateClientCorpOrder;
