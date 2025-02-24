'use client';

import React, { FC, useState, useCallback, useEffect } from 'react';
import { FormProvider, Controller } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import { Decimal } from 'decimal.js';
import {
  Point,
  Tariff,
  User,
  UserRole,
  TariffOnService,
  OrderOnTariffAdditionalService,
} from '@prisma/client';
import HeaderOrder from '@widgets/orders/header-order/HeaderOrder';
import useTariffs from '@shared/components/modal/create-client-corp-order/hooks/tariff/useTariffs';
import useCreateAdminOrderLogic from '@features/orders/create/hooks/useCreateAdminOrderLogic';
import { useRouter } from 'next/navigation';
import { useOrderCreateDrivers } from '@features/orders/create/hooks/driver/useOrderCreateDrivers';
import DriversNearby from '@widgets/drivers-nearby/ui/DriversNearby';
import MapDriver from '@widgets/map/ui/MapDriver';
import PointSelector from '@features/orders/create/inputs/PointSelector';
import AdditionalPoints from '@features/orders/create/inputs/AdditionalPoints';
import RouteMap from '@shared/components/modal/create-client-corp-order/ui/RouteMap';
import usePointSelector from '@features/orders/create/hooks/points/usePointSelector';
import useAdditionalServices from '@features/orders/create/hooks/additional-services/useAdditionalServices';
import usePointSelectionHandlers from '@shared/components/modal/create-client-corp-order/hooks/point/usePointSelectionHandlers';
import useWaitTime from '@shared/components/modal/create-client-corp-order/hooks/wait/useWaitTime';
import useTotalPrice from '@shared/components/modal/create-client-corp-order/hooks/price/useTotalPrice';
import AdditionalServicesList from '@shared/components/modal/create-client-corp-order/ui/AdditionalServicesList';
import WaitTimeSelector from '@shared/components/modal/create-client-corp-order/ui/WaitTimeSelector';
import TariffCheckbox from '@shared/components/modal/create-client-corp-order/ui/TariffCheckbox'; // Добавлен импорт
import { showToast } from '@shared/components/toast/ToastManager';
import {
  fetchPoints,
  FetchPointsResponse,
} from '@shared/components/modal/create-client-corp-order/api/useApi';

export type TariffWithServices = Tariff & {
  tariffAdditionalServices: (TariffOnService & {
    orderTariffAdditionalServices: OrderOnTariffAdditionalService[];
  })[];
};

type SafeUser = Pick<User, 'uuid' | 'fullName' | 'email' | 'phone'>;

type OrderData = {
  uuid: string;
  createdBy: SafeUser;
  tariff: Pick<Tariff, 'uuid' | 'name' | 'serviceLevel' | 'vehicleType'> & {
    tariffAdditionalServices: (TariffOnService & {
      orderTariffAdditionalServices: OrderOnTariffAdditionalService[];
    })[];
  };
  departurePoint: Pick<
    Point,
    'uuid' | 'address' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
  > & {
    pricePerKm: number;
  };
  arrivalPoint: Pick<
    Point,
    'uuid' | 'address' | 'airport' | 'latitude' | 'longitude' | 'terrainDifficulty'
  > & {
    pricePerKm: number;
  };
  assignedDriver?: SafeUser;
  departureTime: string;
  selectedServices: string[];
};

interface OrderProps {
  role: UserRole;
  mode: 'create' | 'edit';
  orderData?: OrderData | null;
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

const OrderCreateView: FC<OrderProps> = ({ role, mode, orderData }) => {
  const router = useRouter();
  const tariffAndServices = useTariffs({
    vehicleType: orderData?.tariff.vehicleType,
  });
  const tariffs = tariffAndServices.tariffs as TariffWithServices[];
  const [allPoints, setAllPoints] = useState<Point[]>([]);
  const [routeDistance, setRouteDistance] = useState<number>(0);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);

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
  } = useCreateAdminOrderLogic(
    tariffs,
    orderData?.tariff.serviceLevel,
    orderData?.tariff.vehicleType,
    orderData,
  );

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = formMethods;

  const {
    drivers,
    searchDriver,
    isDriversLoading,
    selectedDriverInfo,
    page,
    perPage,
    total,
    serverTime,
    handleSearchDriverChange,
    handleDriverClick,
    handlePageChange,
  } = useOrderCreateDrivers({
    assignedDriverId: orderData?.assignedDriver?.uuid ?? null,
    setValue,
  });

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
    handleSearchChange: handleAdditionalHandleSearchChange,
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

  const { waitTime, additionalWaitTimeCost, adjustWaitTime, minWaitTime, maxWaitTime } =
    useWaitTime({
      selectedTariff,
      departurePoint,
    });

  const { isPointAlreadySelected, routeCost } = usePointSelectionHandlers({
    departurePoint: departurePoint ?? undefined,
    arrivalPoint: arrivalPoint ?? undefined,
    additionalPoints: additionalPoints ?? [],
    routeDistance,
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
        if (departurePoint?.uuid === point.uuid) {
          onFromSelectPoint(null);
        } else if (arrivalPoint?.uuid === point.uuid) {
          onToSelectPoint(null);
        } else if (additionalPoints) {
          const index = additionalPoints.findIndex((p) => p?.uuid === point.uuid);
          if (index !== -1) {
            onAdditionalSelectPoint(null, index);
          }
        }
      } else {
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

  const onSubmit = async (data: any) => {
    const payload = {
      createdBy: orderData?.createdBy.uuid || data.createdBy,
      tariffUuid: selectedTariff?.uuid || orderData?.tariff.uuid,
      departureTime: data.departureTime,
      departurePoint: departurePoint?.uuid || data.departurePoint,
      arrivalPoint: arrivalPoint?.uuid || data.arrivalPoint,
      intermediatePoints:
        additionalPoints
          ?.map((point) => point?.uuid)
          .filter((uuid): uuid is string => Boolean(uuid)) || [],
      basePrice: data.basePrice ? Number(data.basePrice) : totalPrice.toNumber(),
      selectedServices: selectedServices || orderData?.selectedServices || [],
      assignedDriverId: selectedDriverInfo?.uuid || data.assignedDriverId || null,
      description: data.description || '',
      flightNumber: data.flightNumber || '',
      waitingTimeMinutes: waitTime || 0,
    };

    try {
      const response =
        mode === 'create'
          ? await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
          : await fetch(`/api/orders/${orderData?.uuid}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

      if (response.ok) {
        showToast.success(mode === 'create' ? 'Заказ создан успешно!' : 'Заказ обновлен успешно!');
        router.push('/orders');
      } else {
        const errorData = await response.json();
        showToast.error('Ошибка при сохранении заказа: ' + JSON.stringify(errorData));
      }
    } catch (error) {
      showToast.error(
        'Ошибка запроса: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'),
      );
    }
  };

  return (
    <FormProvider {...formMethods}>
      <div className="flex flex-col gap-4 p-8 bg-white rounded-3xl">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <h2 className="text-3xl font-semibold">
            {mode === 'create' ? 'Создание заказа' : 'Редактирование заказа'}
          </h2>

          <div className="w-full h-[500px] flex flex-row gap-4">
            <div className="hidden lg:flex flex-1 flex-shrink-0 basis-[calc(65%-1.5rem)] h-auto bg-white rounded-xl border">
              <MapDriver
                selectedDriverInfo={selectedDriverInfo}
                serverTime={serverTime || new Date()}
              />
            </div>
            <div className="flex-1 flex-shrink-0 basis-[calc(35%-1.5rem)] h-auto flex flex-col justify-between gap-4">
              <DriversNearby
                drivers={drivers}
                isDriversLoading={isDriversLoading}
                searchDriver={searchDriver}
                handleSearchDriverChange={handleSearchDriverChange}
                selectedDriverInfo={selectedDriverInfo}
                handleDriverClick={handleDriverClick}
                page={parseInt(page)}
                perPage={parseInt(perPage)}
                currentTotal={total}
                handlePageChange={(newPage) => handlePageChange(String(newPage))}
                serverTime={serverTime || new Date()}
              />
            </div>
          </div>

          {/* Секция выбора тарифа */}
          <div className={'flex flex-row gap-4'}>
            <div className="hidden lg:flex flex-1 flex-shrink-0 basis-[calc(65%-1.5rem)] h-auto bg-white rounded-xl p-8 flex-col">
              <TariffCheckbox
                tariffs={tariffs}
                selectedServiceLevel={selectedServiceLevel}
                selectedVehicleType={selectedVehicleType}
                selectedTariffUuid={selectedTariff?.uuid || null}
                handleServiceLevelChange={handleServiceLevelChange}
                handleVehicleTypeChange={handleVehicleTypeChange}
                {...formMethods}
              />
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
            <div className={'w-full flex flex-col gap-4 p-4'}>
              <AdditionalServicesList
                label="Дополнительные опции"
                availableServices={availableServices}
                handleServiceSelection={handleServiceSelection}
                selectedServices={selectedServices}
                totalAdditionalServicesPrice={totalAdditionalServicesPrice}
              />
            </div>
          </div>

          <div className="flex flex-row gap-4">
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
            <div className="w-full flex flex-row gap-4 p-4 rounded-md">
              <div className={'w-full flex flex-col gap-4'}>
                <PointSelector
                  control={control}
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
                  control={control}
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
                <div className="text-sm bg-gray-50 rounded-md p-3 border">
                  <div className="grid grid-cols-[20px_80px_1fr] gap-y-2 gap-x-4">
                    {departurePoint && (
                      <>
                        <span className="font-semibold text-blue-500">A</span>
                        <span className="font-semibold">Откуда:</span>
                        <span>{departurePoint.address}</span>
                      </>
                    )}
                    {arrivalPoint && (
                      <>
                        <span className="font-semibold text-red-500">B</span>
                        <span className="font-semibold">Куда:</span>
                        <span>{arrivalPoint.address}</span>
                      </>
                    )}
                    {additionalPoints &&
                      additionalPoints.some((point) => point !== null) &&
                      additionalPoints
                        .filter((point): point is Point => point !== null)
                        .map((point, index) => (
                          <React.Fragment key={point.uuid}>
                            <span className="font-semibold text-green-500">
                              {String.fromCharCode(67 + index)}
                            </span>
                            <span className="font-semibold">Точка:</span>
                            <span>{point.address}</span>
                          </React.Fragment>
                        ))}
                    {routeDuration && (
                      <>
                        <span className="font-semibold text-purple-500">⏱</span>
                        <span className="font-semibold">Время:</span>
                        <span>{routeDuration}</span>
                      </>
                    )}
                    {routeDistance > 0 && (
                      <>
                        <span className="font-semibold text-teal-500">📏</span>
                        <span className="font-semibold">Км:</span>
                        <span>{routeDistance.toFixed(2)} км</span>
                      </>
                    )}
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
                handleSearchChange={handleAdditionalHandleSearchChange}
                filteredPoints={additionalFilteredPoints}
                onSelectPoint={(point: Point, index?: number) =>
                  handleAdditionalSelectPoint(point, index ?? 0)
                }
                selectorRef={additionalSelectorRef}
                selectedPoints={additionalPoints ?? []}
                onRemovePoint={onRemovePoint || (() => {})}
                onChangeOrder={onChangeOrder}
                onMaxLimitReached={() => alert('Достигнут лимит дополнительных остановок')}
                totalAdditionalPrice={totalAdditionalPrice}
              />
            </div>
          </div>

          {/* Секция дополнительных опций */}
          <div className="flex border"></div>

          {/* Секция общей цены */}
          <h2 className="text-2xl font-semibold">Общая цена</h2>
          <div>
            <h3>
              Общая сумма заказа: <span className={'font-bold'}>{totalPrice.toNumber()} сом</span>
            </h3>
          </div>

          <div className="w-full flex justify-end">
            <IButton type="submit">
              {mode === 'create' ? 'Создать заказ' : 'Сохранить изменения'}
            </IButton>
          </div>
        </form>
      </div>
    </FormProvider>
  );
};

export default OrderCreateView;
