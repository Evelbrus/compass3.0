import React, { useState, useCallback, useEffect } from 'react';
import { FormProvider } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import { CloseIcon } from '@shared/components/ui/icon';
import AnimatedComponent from '@shared/components/animated/CommonAnimated/AnimatedComponent';
import { Decimal } from 'decimal.js';
import { Point, ServiceLevels, VehicleType } from '@prisma/client';
import { ExtendedTariff } from '@shared/prisma/interface/orders/interface';
import useTariffs from '@shared/components/modal/create-client-corp-order/hooks/tariff/useTariffs';
import usePointSelector from '@shared/components/modal/create-client-corp-order/hooks/point/usePointSelector';
import useCreateClientCorpOrderLogic, {
  CreateClientCorpOrderData,
} from '@shared/components/modal/create-client-corp-order/hooks/useCreateClientCorpOrder';
import useAdditionalServices from '@shared/components/modal/create-client-corp-order/hooks/additional-service/useAdditionalServices';
import useWaitTime from '@shared/components/modal/create-client-corp-order/hooks/wait/useWaitTime';
import useTotalPrice from '@shared/components/modal/create-client-corp-order/hooks/price/useTotalPrice';
import useSubmitOrder from '@shared/components/modal/create-client-corp-order/hooks/useSubmitOrder';
import TariffCheckbox from '@shared/components/modal/create-client-corp-order/ui/TariffCheckbox';
import PointSelector from '@shared/components/modal/create-client-corp-order/inputs/PointSelector';
import AdditionalPoints from '@shared/components/modal/create-client-corp-order/ui/AdditionalPoints';
import AdditionalServicesList from '@shared/components/modal/create-client-corp-order/ui/AdditionalServicesList';
import FlightDetails from '@shared/components/modal/create-client-corp-order/ui/FlightDetails';
import usePointSelectionHandlers from '@shared/components/modal/create-client-corp-order/hooks/point/usePointSelectionHandlers';
import WaitTimeSelector from '@shared/components/modal/create-client-corp-order/ui/WaitTimeSelector';
import { showToast } from '@shared/components/toast/ToastManager';
import { useRouter } from 'next/navigation';
import RouteMap from '@shared/components/modal/create-client-corp-order/ui/RouteMap';
import {
  fetchPoints,
  FetchPointsResponse,
} from '@shared/components/modal/create-client-corp-order/api/useApi';

interface CreateClientCorpOrderProps {
  onClose: () => void;
}

const transformPoint = (point: any): Point => {
  return {
    ...point,
    pricePerKm: Number(point.pricePerKm),
    latitude: Number(point.latitude),
    longitude: Number(point.longitude),
    terrainDifficulty: Number(point.terrainDifficulty),
    airport: point.airport,
    createdAt: new Date(point.createdAt),
    updatedAt: new Date(point.updatedAt),
  };
};

const CreateClientCorpOrder: React.FC<CreateClientCorpOrderProps> = ({ onClose }) => {
  const router = useRouter();
  const [_orderId, setOrderId] = useState<string>('');
  const [ServiceLevel, _setServiceLevel] = useState<ServiceLevels>();
  const [VehicleType, _setVehicleType] = useState<VehicleType>();
  const [allPoints, setAllPoints] = useState<Point[]>([]);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);
  const tariffAndServices = useTariffs({ vehicleType: VehicleType });
  const tariffs: ExtendedTariff[] = tariffAndServices.tariffs || [];

  const handleDurationUpdate = useCallback((duration: string | null) => {
    setRouteDuration(duration);
  }, []);

  const {
    selectedServiceLevel,
    selectedVehicleType,
    selectedTariff,
    handleServiceLevelChange,
    handleVehicleTypeChange,
    formMethods,
  } = useCreateClientCorpOrderLogic(tariffs, ServiceLevel, VehicleType);

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
  } = usePointSelector({ mode: 'single', allPoints });

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
  } = usePointSelector({ mode: 'single', allPoints });

  const {
    isOpen: isAdditionalOpen,
    searchValue: additionalSearchValue,
    search: additionalSearch,
    filteredPoints: additionalFilteredPoints,
    onOpenSelect: onAdditionalOpenSelect,
    onSearchValueChange: onAdditionalSearchValueChange,
    handleSearchChange: onAdditionalHandleSearchChange,
    onSelectPoint: onAdditionalSelectPoint,
    selectorRef: additionalSelectorRef,
    selectedPoints: additionalPoints,
    onRemovePoint,
    onChangeOrder,
    totalAdditionalPrice,
  } = usePointSelector({
    mode: 'multiple',
    initialSelectedPoints: Array(5).fill(null),
    allPoints,
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
    routeDistance,
  });

  const handleDistanceUpdate = useCallback((distance: number) => {
    setRouteDistance(distance);
  }, []);

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

  const handlePointSelect = useCallback(
    (point: Point, isSelected: boolean) => {
      if (isSelected) {
        // Если точка уже выбрана, "отжимаем" её
        if (departurePoint?.uuid === point.uuid) {
          onFromSelectPoint(null); // Сбрасываем точку отправления
        } else if (arrivalPoint?.uuid === point.uuid) {
          onToSelectPoint(null); // Сбрасываем точку прибытия
        } else if (additionalPoints) {
          const index = additionalPoints.findIndex((p) => p?.uuid === point.uuid);
          if (index !== -1) {
            onAdditionalSelectPoint(null, index); // Удаляем дополнительную точку
          }
        }
      } else {
        // Если точка не выбрана, добавляем её как обычно
        if (!departurePoint) {
          handleDepartureSelectPoint(point);
        } else if (!arrivalPoint) {
          handleArrivalSelectPoint(point);
        } else if (additionalPoints) {
          const freeIndex = additionalPoints.findIndex((p) => p === null);
          if (freeIndex !== -1) {
            handleAdditionalSelectPoint(point, freeIndex);
          } else {
            alert('Достигнут лимит точек маршрута');
          }
        }
      }
    },
    [
      departurePoint,
      arrivalPoint,
      additionalPoints,
      handleDepartureSelectPoint,
      handleArrivalSelectPoint,
      handleAdditionalSelectPoint,
      onFromSelectPoint,
      onToSelectPoint,
      onAdditionalSelectPoint,
    ],
  );

  const { waitTime, additionalWaitTimeCost, adjustWaitTime, minWaitTime, maxWaitTime } =
    useWaitTime({
      selectedTariff,
      departurePoint,
    });

  const totalPrice = useTotalPrice({
    tariffPrice: selectedTariff?.price ? new Decimal(selectedTariff.price) : null,
    additionalServicesPrice: totalAdditionalServicesPrice
      ? new Decimal(totalAdditionalServicesPrice)
      : null,
    additionalPointsPrice: totalAdditionalPrice ? new Decimal(totalAdditionalPrice) : null,
    waitTimeCost: additionalWaitTimeCost ? new Decimal(additionalWaitTimeCost) : null,
    routeCost: routeCost ? new Decimal(routeCost) : null,
  });

  const { submitOrder, isSubmitting, error } = useSubmitOrder();

  const onSubmit = useCallback(
    async (formData: CreateClientCorpOrderData) => {
      try {
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
          showToast.success('Заказ создан успешно!');
          router.push('/orders');
          onClose();
        } else {
          throw new Error('Не удалось получить uuid заказа из ответа сервера');
        }
      } catch (err) {
        showToast.error(
          'Ошибка при создании заказа: ' +
            (err instanceof Error ? err.message : 'Неизвестная ошибка'),
        );
      }
    },
    [
      selectedTariff,
      departurePoint,
      arrivalPoint,
      additionalPoints,
      selectedServices,
      totalPrice,
      waitTime,
      setOrderId,
      router,
      onClose,
      submitOrder,
    ],
  );

  useEffect(() => {
    fetchPoints('', '1', '1000', 'createdAt', 'asc')
      .then((response: FetchPointsResponse) => {
        const mappedPoints = response.points.map(transformPoint);
        setAllPoints(mappedPoints);
      })
      .catch((error) => {
        console.error('Ошибка при получении всех точек:', error);
      });
  }, []);

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

            <h2 className="text-2xl font-semibold">2. Выберите маршрут</h2>

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
                  filteredPoints={fromFilteredPoints}
                  loading={fromLoading}
                  onSelectPoint={handleDepartureSelectPoint}
                  selectorRef={fromSelectorRef}
                  observerRef={fromObserverRef}
                  selectedPoint={departurePoint}
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
                  filteredPoints={toFilteredPoints}
                  loading={toLoading}
                  onSelectPoint={handleArrivalSelectPoint}
                  selectorRef={toSelectorRef}
                  observerRef={toObserverRef}
                  selectedPoint={arrivalPoint}
                  arrivalPointPrice={
                    arrivalPoint?.pricePerKm ? Number(arrivalPoint.pricePerKm) : undefined
                  }
                />
                {/* Общая информация под селектами */}
                <div className="text-sm bg-gray-50 rounded-md p-3 border">
                  <div className="grid grid-cols-[20px_80px_1fr] gap-y-2 gap-x-4">
                    {/* Точка отправления */}
                    {departurePoint && (
                      <>
                        <span className="font-semibold text-blue-500">A</span>
                        <span className="font-semibold">Откуда:</span>
                        <span>{departurePoint.address}</span>
                      </>
                    )}
                    {/* Точка прибытия */}
                    {arrivalPoint && (
                      <>
                        <span className="font-semibold text-red-500">B</span>
                        <span className="font-semibold">Куда:</span>
                        <span>{arrivalPoint.address}</span>
                      </>
                    )}
                    {/* Дополнительные точки */}
                    {additionalPoints &&
                      additionalPoints.some((point) => point !== null) &&
                      additionalPoints
                        .filter((point): point is Point => point !== null)
                        .map((point, index) => (
                          <React.Fragment key={point.uuid}>
                            <span className="font-semibold text-green-500">
                              {String.fromCharCode(67 + index)} {/* C, D, E и т.д. */}
                            </span>
                            <span className="font-semibold">Точка:</span>
                            <span>{point.address}</span>
                          </React.Fragment>
                        ))}
                    {/* Время в пути */}
                    {routeDuration && (
                      <>
                        <span className="font-semibold text-purple-500">⏱</span>
                        <span className="font-semibold">Время:</span>
                        <span>{routeDuration}</span>
                      </>
                    )}
                    {/* Расстояние в километрах */}
                    {routeDistance > 0 && (
                      <>
                        <span className="font-semibold text-teal-500">📏</span>
                        <span className="font-semibold">Км:</span>
                        <span>{routeDistance.toFixed(2)} км</span>
                      </>
                    )}
                    {/* Стоимость маршрута */}
                    {routeCost && (
                      <>
                        <span className="font-semibold text-orange-500">💸</span>
                        <span className="font-semibold">Стоимость маршрута:</span>
                        <span>{routeCost.toFixed(2)} сом</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <AdditionalPoints
                label="Дополнительные остановки"
                isOpen={isAdditionalOpen}
                searchValue={additionalSearchValue}
                onOpenSelect={onAdditionalOpenSelect}
                onSearchValueChange={onAdditionalSearchValueChange}
                search={additionalSearch}
                filteredPoints={additionalFilteredPoints}
                onSelectPoint={(point: Point, index?: number) =>
                  handleAdditionalSelectPoint(point, index ?? 0)
                }
                selectorRef={additionalSelectorRef}
                selectedPoints={additionalPoints ?? []}
                onRemovePoint={onRemovePoint || (() => {})}
                onChangeOrder={onChangeOrder}
                handleSearchChange={onAdditionalHandleSearchChange}
                onMaxLimitReached={() => alert('Достигнут лимит дополнительных остановок')}
                totalAdditionalPrice={totalAdditionalPrice}
              />
            </div>

            <h2 className="text-2xl font-semibold">2.1. Интерактивная карта</h2>

            <RouteMap
              allPoints={allPoints}
              selectedPoints={[
                departurePoint ?? null,
                ...(additionalPoints?.filter((p): p is Point => p !== null) ?? []),
                arrivalPoint ?? null,
              ]}
              onPointSelect={handlePointSelect}
              onDistanceUpdate={handleDistanceUpdate}
              onDurationUpdate={handleDurationUpdate}
            />

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
