import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { User, Point, VehicleType, ServiceLevels } from '@prisma/client';
import { useFormContext, Controller } from 'react-hook-form';
import {
  CreateOrderData,
  ExtendedTariff,
  TariffAdditionalService,
} from '@shared/prisma/interface/orders/interface';
import { TextInput, SelectSingle } from '@shared/components/ui/inputs';
import { SelectOption } from '@shared/lib/effector';
import { useIntermediatePointsManager } from '@features/orders/create/helpers';
import { CheckboxInput } from '@shared/components/ui/inputs/chekbox';

interface AdditionalService {
  uuid: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ClientWidgetProps {
  clients: User[] | null;
  isClientsLoading: boolean;
  setSearchClient: React.Dispatch<React.SetStateAction<string>>;
  refetchClients: (searchQuery?: string) => void;
  tariffs: ExtendedTariff[];
  selectedAdditionalServices: string[];
  handleAdditionalServiceChangeCallback: (
    e: React.ChangeEvent<HTMLInputElement>,
    serviceUuid: string,
  ) => void;
  handleVehicleTypeChange: (value: string) => void;
  selectedVehicleType: string;
  vehicleTypes: VehicleType[];
  handleServiceLevelChange: (value: string) => void;
  selectedServiceLevel: string;
  serviceLevels: ServiceLevels[];
  handleWaitingTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  waitingTimeMinutes: number;
  waitingInfo: {
    freeWaitTime: number;
    pricePerMinute: number;
    isAirport: boolean;
  } | null;
  getAvailablePoints: (exclude: string[]) => Point[];
  additionalServices: AdditionalService[];
}

const ClientWidget: React.FC<ClientWidgetProps> = ({
  clients,
  isClientsLoading,
  setSearchClient,
  tariffs,
  selectedAdditionalServices,
  handleAdditionalServiceChangeCallback,
  handleWaitingTimeChange,
  waitingTimeMinutes,
  waitingInfo,
  getAvailablePoints,
  additionalServices,
}) => {
  const formMethods = useFormContext<CreateOrderData>();
  const { watch, setValue, formState, control } = useFormContext<CreateOrderData>();
  const formData = watch();
  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [phoneValue, setPhoneValue] = useState<string>('');
  const [isNewClientMode, setIsNewClientMode] = useState(false);
  const [localWaitingTime, setLocalWaitingTime] = useState<number>(waitingTimeMinutes);
  const [isWaitingTimeEnabled, setIsWaitingTimeEnabled] = useState(false);
  const [isAdditionalServicesOpen, setIsAdditionalServicesOpen] = useState(true);
  const [isIntermediatePointsOpen, setIsIntermediatePointsOpen] = useState(true);
  const { handleChangeIntermediatePoint } = useIntermediatePointsManager(formMethods);

  const clientOptions = useMemo(() => {
    if (!clients) return [];
    return clients.map((client) => ({
      label: client.fullName,
      value: client.uuid,
    }));
  }, [clients]);

  useEffect(() => {
    if (clients && formData.createdBy) {
      const client = clients.find((c) => c.uuid === formData.createdBy);
      setSelectedClient(client || null);
      //Убираем форматирование
      setPhoneValue(client?.phone || '');
    } else {
      setSelectedClient(null);
      setPhoneValue('');
    }
  }, [clients, formData.createdBy]);

  useEffect(() => {
    if (waitingInfo) {
      setLocalWaitingTime(waitingInfo.freeWaitTime);
      setIsWaitingTimeEnabled(true);
    } else {
      setLocalWaitingTime(0);
      setIsWaitingTimeEnabled(false);
    }
  }, [waitingInfo]);

  useEffect(() => {
    if (isWaitingTimeEnabled) {
      handleWaitingTimeChange({
        target: { value: localWaitingTime.toString() },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, [localWaitingTime, handleWaitingTimeChange, isWaitingTimeEnabled]);

  const handleIncrementWaitingTime = useCallback(() => {
    if (isWaitingTimeEnabled) {
      setLocalWaitingTime((prev) => Math.min(prev + 5, 60));
    }
  }, [isWaitingTimeEnabled]);

  const handleDecrementWaitingTime = useCallback(() => {
    if (isWaitingTimeEnabled && waitingInfo) {
      setLocalWaitingTime((prev) => Math.max(prev - 5, waitingInfo.freeWaitTime));
    }
  }, [isWaitingTimeEnabled, waitingInfo]);

  const handleClientChange = (option: SelectOption<string> | null) => {
    const selectedUuid = option?.value || '';
    setValue('createdBy', selectedUuid);
    const client = clients?.find((c) => c.uuid === selectedUuid) || null;
    setSelectedClient(client);
    //Убираем форматирование
    setPhoneValue(client?.phone || '');
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchClient(e.target.value);
  };

  const handleToggleClientMode = () => {
    setIsNewClientMode(!isNewClientMode);
    if (isNewClientMode) {
      setValue('fullName', '');
      setValue('phone', '');
    } else {
      setValue('createdBy', '');
      setSelectedClient(null);
      setPhoneValue('');
    }
  };

  const selectedTariff = tariffs?.find((t) => t.uuid === formData.tariffUuid);

  const toggleAdditionalServices = () => {
    setIsAdditionalServicesOpen(!isAdditionalServicesOpen);
  };

  const toggleIntermediatePoints = () => {
    setIsIntermediatePointsOpen(!isIntermediatePointsOpen);
  };

  const getIntermediatePointCount = () => {
    return (control._formValues.intermediatePoints || []).filter(Boolean).length;
  };

  const getIntermediatePointsInfo = () => {
    const count = getIntermediatePointCount();
    const pricePerPoint = selectedTariff?.additionalPointPrice || 0;
    const totalPrice = count * pricePerPoint;
    return { count, totalPrice };
  };

  const { count: intermediatePointsCount, totalPrice: intermediatePointsTotalPrice } =
    getIntermediatePointsInfo();

  const intermediatePointsLabel = useMemo(() => {
    return `Intermediate Points (${intermediatePointsCount} опций ${intermediatePointsTotalPrice}с)`;
  }, [intermediatePointsCount, intermediatePointsTotalPrice]);

  const handleIntermediatePointChange = (index: number, value: string) => {
    handleChangeIntermediatePoint(index, value);
  };

  const getAvailableAdditionalServices = (): (AdditionalService | TariffAdditionalService)[] => {
    const tariffServices = selectedTariff?.tariffAdditionalServices;
    if (tariffServices && tariffServices.length > 0) {
      return tariffServices;
    }
    return additionalServices;
  };

  const availableAdditionalServices = useMemo(() => {
    const services = getAvailableAdditionalServices();
    return [...services].sort((a, b) => a.name.localeCompare(b.name));
  }, [additionalServices, selectedTariff]);

  const getSelectedAdditionalServicesInfo = () => {
    if (!selectedTariff?.tariffAdditionalServices) {
      return { count: 0, totalPrice: 0 };
    }

    const selectedServices = selectedTariff.tariffAdditionalServices.filter((s) =>
      selectedAdditionalServices.includes(s.uuid),
    );
    const count = selectedServices.length;
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

    return { count, totalPrice };
  };

  const { count: selectedServicesCount, totalPrice: selectedServicesTotalPrice } =
    getSelectedAdditionalServicesInfo();

  const additionalServicesLabel = useMemo(() => {
    if (availableAdditionalServices.length === 0) {
      return 'Additional Services';
    }
    return `Additional Services (${selectedServicesCount} опций ${selectedServicesTotalPrice}с)`;
  }, [availableAdditionalServices, selectedServicesCount, selectedServicesTotalPrice]);

  useEffect(() => {
    const currentPoints = watch().intermediatePoints || [];
    if (currentPoints.length < 5) {
      const updatedPoints = [...currentPoints, ...Array(5 - currentPoints.length).fill('')];
      setValue('intermediatePoints', updatedPoints);
    }
  }, [setValue, watch]);

  const intermediatePointsArray = useMemo(() => {
    return Array(5).fill(null);
  }, []);

  return (
    <div className="w-full flex bg-white flex-col gap-4 p-4 rounded-md">
      <div className={'w-full flex justify-end'}>
        <button
          type="button"
          className={`w-[200px] ml-2 px-3 py-2 rounded-md hover:bg-green-600 ${
            isNewClientMode ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-green-500 text-white'
          }`}
          onClick={handleToggleClientMode}
        >
          {isNewClientMode ? 'Поиск клиентов' : 'Новый клиент'}
        </button>
      </div>
      {/*Client Phone and Search  */}
      <div className="w-full flex items-start justify-between gap-4">
        <div className={'w-full flex flex-col'}>
          <label className="block mb-2 text-5 leading-5 font-bold">
            {isNewClientMode ? 'Телефон клиента:' : 'Номер клиента:'}
          </label>
          <TextInput
            value={isNewClientMode ? formData.phone || '' : phoneValue || ''}
            readOnly={!isNewClientMode}
            className="flex-1 text-4 leading-4 h-full"
            classNameBorderRadius={'rounded-lg border'}
            classNamePlaceholder={'text-4 leading-4'}
            placeholder={isNewClientMode ? 'Телефон' : 'Номер телефона'}
            onChange={isNewClientMode ? (value) => setValue('phone', value) : () => {}}
          />
        </div>
        <div className={'w-full flex flex-col'}>
          <div className="flex items-center justify-between">
            <label className="block mb-2 text-5 leading-5 font-bold">
              {isNewClientMode ? 'Создание клиента:' : 'Поиск клиента:'}
            </label>
          </div>
          {isNewClientMode ? (
            <TextInput
              placeholder="Полное имя"
              value={formData.fullName || ''}
              onChange={(value) => setValue('fullName', value)}
              className={'text-4 leading-4 h-full'}
              classNamePlaceholder={'text-5 leading-5'}
            />
          ) : (
            <SelectSingle
              options={clientOptions}
              value={
                formData.createdBy
                  ? clientOptions.find((option) => option.value === formData.createdBy) || null
                  : null
              }
              onChange={handleClientChange}
              disabled={isClientsLoading}
              placeholder={
                isClientsLoading
                  ? 'Loading clients...'
                  : clients === null
                    ? 'Error loading clients'
                    : clients.length === 0
                      ? 'No clients'
                      : 'Select a client'
              }
              isSearchable
              onInputChange={handleSearchInputChange}
              className={'bg-blue-100 hover:bg-blue-200'}
            />
          )}
          {formState.errors.createdBy?.message && (
            <span className="text-red-500">{formState.errors.createdBy.message}</span>
          )}
        </div>
      </div>
      <div className="w-full flex items-start justify-between gap-4">
        {/*Left side: Additional services and waiting time */}
        <div className="w-1/2 flex flex-col gap-4">
          {availableAdditionalServices && availableAdditionalServices.length > 0 && (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={toggleAdditionalServices}
                className="w-full text-left py-2 px-3 border rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none"
              >
                {additionalServicesLabel}
              </button>
              {isAdditionalServicesOpen && (
                <div className="p-2 border rounded-md flex flex-col gap-2">
                  {availableAdditionalServices.map((s) => {
                    const isServiceAvailable = 'isAvailable' in s ? s.isAvailable : true;
                    return (
                      <div
                        key={s.uuid}
                        style={{
                          textDecoration: isServiceAvailable ? 'none' : 'line-through',
                          pointerEvents: isServiceAvailable ? 'auto' : 'none',
                          opacity: isServiceAvailable ? 1 : 0.6,
                        }}
                      >
                        <CheckboxInput
                          label={`${s.name} ${'price' in s ? `(${s.price})` : ''}`}
                          checked={selectedAdditionalServices.includes(s.uuid)}
                          onChange={(e) => handleAdditionalServiceChangeCallback(e, s.uuid)}
                          disabled={!isServiceAvailable}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div className="flex flex-col gap-2">
            {waitingInfo ? (
              <div className="flex flex-col gap-2">
                <p>Время ожидания клиента {waitingInfo.isAirport ? 'Aeroport ' : ''}</p>
                <div className="flex items-center justify-between bg-[#989898] text-white p-2 rounded-md">
                  <button
                    type="button"
                    onClick={handleDecrementWaitingTime}
                    disabled={!isWaitingTimeEnabled}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-700 focus:outline-none"
                  >
                    -
                  </button>
                  <Controller
                    name="waitingTimeMinutes"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        value={localWaitingTime}
                        readOnly
                        className="mx-2 text-center w-16 bg-transparent"
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                      />
                    )}
                  />
                  <button
                    type="button"
                    onClick={handleIncrementWaitingTime}
                    disabled={!isWaitingTimeEnabled}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-700 focus:outline-none"
                  >
                    +
                  </button>
                </div>
                <p>Бесплатное время ожидания клиента {waitingInfo.isAirport ? 'Aeroport ' : ''}</p>
                <span
                  className={
                    'p-4 w-full text-4 leading-4 bg-[#989898] text-white flex justify-center items-center rounded-md'
                  }
                >
                  {waitingInfo.pricePerMinute} минут
                </span>
              </div>
            ) : (
              <div>
                <p>Free wait time: Необходимо выбрать тариф для информации</p>
                <p>
                  Price per minute after free wait time: Необходимо выбрать тариф для информации
                </p>
              </div>
            )}
          </div>
        </div>

        {/*Right side: Intermediate Points and Description */}
        <div className="w-1/2 flex flex-col gap-4">
          <div className={'flex flex-row items-center gap-2'}>
            <label className={'w-1/2 block text-5 leading-5 font-bold'}>Тип клиента</label>
            <TextInput
              readOnly={true}
              value={selectedClient ? selectedClient.role : 'Не выбран'}
              className={'text-4 leading-4 h-full'}
              classNameBorderRadius={'border-none rounded-md'}
              classNamePlaceholder={'text-4 leading-4'}
              onChange={() => {}}
            />
          </div>
          <div className={'flex flex-col'}>
            <label className="block mb-2 text-5 leading-5 font-bold">Description:</label>
            <TextInput
              type="textarea"
              value={formData.description || ''}
              onChange={(value) => setValue('description', value)}
              maxLength={1000}
              className={'h-28'}
              classNameBorderRadius={'rounded-lg border'}
              classNamePlaceholder={'text-4 leading-4'}
            />
            {formState.errors.description?.message && (
              <span className="text-red-500">{formState.errors.description.message}</span>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={toggleIntermediatePoints}
              className="w-full text-left py-2 px-3 border rounded-md bg-gray-100 hover:bg-gray-200 focus:outline-none"
            >
              {intermediatePointsLabel}
            </button>
            {isIntermediatePointsOpen && (
              <div className="p-2 border rounded-md">
                <Controller
                  name="intermediatePoints"
                  control={control}
                  render={({ field }) => (
                    <>
                      {intermediatePointsArray.map((_, index) => (
                        <div key={index} className="flex gap-2 items-center mb-2">
                          <select
                            value={field.value?.[index] || ''}
                            onChange={(e) => {
                              handleIntermediatePointChange(index, e.target.value);
                            }}
                            className="border rounded-md p-2 flex-1"
                          >
                            <option value="">Select an intermediate point</option>
                            {getAvailablePoints([
                              control._formValues.departurePoint || '',
                              control._formValues.arrivalPoint || '',
                              ...(field.value || []).filter((_, i) => i !== index),
                            ]).map((po) => (
                              <option key={po.uuid} value={po.uuid}>
                                {po.address}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleIntermediatePointChange(index, '')}
                            className="p-2 rounded-md hover:bg-red-200 text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </>
                  )}
                />
                {formState.errors.intermediatePoints && (
                  <span className="text-red-500">
                    {formState.errors.intermediatePoints.message}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientWidget;
