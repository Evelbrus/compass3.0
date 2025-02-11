import { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { AdditionalService, Point } from '@prisma/client';
import { closeModal } from '@shared/lib/effector';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';

interface SelectedAdditionalService {
  uuid: string;
}

interface UseCreateClientCorpOrderProps {
  onClose: () => void;
  tariffs: DetailTariffData[];
  additionalServices: AdditionalService[];
  isServiceAvailableForTariff: (serviceUuid: string) => any;
}

interface UseCreateClientCorpOrderReturn {
  selectedTariff: string;
  setSelectedTariff: (tariffUuid: string) => void;
  selectedAdditionalServices: SelectedAdditionalService[];
  handleAdditionalServiceChangeCallback: (
    additionalServiceUuid: string,
    isChecked: boolean,
  ) => void;
  handleCreateOrder: () => Promise<void>;
  closeModalHandler: () => void;
  formMethods: UseFormReturn<{
    departureTime: string;
    flightNumber: string;
    description: string;
  }>;
  isServiceAvailableForTariff: (serviceUuid: string) => any;
  departurePoint: string;
  arrivalPoint: string;
  departurePoints: Point[];
  arrivalPoints: Point[];
  getAvailablePoints: () => Point[];
  handleSetAdditionalPoints: (index: number, point: Point | null) => void;
  additionalPointsSelected: (Point | null)[];
}

const useCreateClientCorpOrder = ({
  onClose,
  tariffs,
  additionalServices,
  isServiceAvailableForTariff,
}: UseCreateClientCorpOrderProps): UseCreateClientCorpOrderReturn => {
  const [selectedTariff, setSelectedTariff] = useState<string>('');
  const [selectedAdditionalServices, setSelectedAdditionalServices] = useState<
    SelectedAdditionalService[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [departurePoint, setDeparturePoint] = useState<string>('');
  const [arrivalPoint, setArrivalPoint] = useState<string>('');
  const [departurePoints, setDeparturePoints] = useState<Point[]>([]);
  const [arrivalPoints, setArrivalPoints] = useState<Point[]>([]);
  const [additionalPointsSelected, setAdditionalPointsSelected] = useState<(Point | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);

  const formMethods = useForm({
    defaultValues: {
      departureTime: '',
      flightNumber: '',
      description: '',
    },
  });
  const { handleSubmit, reset } = formMethods;

  const closeModalHandler = () => {
    onClose();
    closeModal();
  };

  const handleAdditionalServiceChangeCallback = (
    additionalServiceUuid: string,
    isChecked: boolean,
  ) => {
    if (isChecked) {
      setSelectedAdditionalServices((prev) => [...prev, { uuid: additionalServiceUuid }]);
    } else {
      setSelectedAdditionalServices((prev) => prev.filter((s) => s.uuid !== additionalServiceUuid));
    }
  };

  const calculateAdditionalPointsPrice = () => {
    const selectedTariffData = tariffs.find((tariff) => tariff.uuid === selectedTariff);
    const additionalPointPrice = selectedTariffData?.additionalPointPrice || 0;
    return additionalPointsSelected.reduce(
      (total, point) => total + (point ? additionalPointPrice : 0),
      0,
    );
  };

  const handleCreateOrder = handleSubmit(async (data) => {
    try {
      const selectedTariffData = tariffs.find((tariff) => tariff.uuid === selectedTariff);
      if (!selectedTariffData) {
        throw new Error('Тариф не выбран.');
      }
      if (!departurePoint || !arrivalPoint) {
        throw new Error('Точки отправления и прибытия не выбраны.');
      }
      if (departurePoint === arrivalPoint) {
        throw new Error('Точки отправления и прибытия не могут быть одинаковыми.');
      }

      const selectedAdditionalServiceIds = selectedAdditionalServices.map((s) => s.uuid);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tariffId: selectedTariff,
          additionalServiceIds: selectedAdditionalServiceIds,
          departureTime: data.departureTime,
          departurePointId: departurePoint,
          arrivalPointId: arrivalPoint,
          flightNumber: data.flightNumber,
          description: data.description,
          basePrice: selectedTariffData.price,
          additionalPointPrice: calculateAdditionalPointsPrice(),
          additionalPoints: additionalPointsSelected.map((point) => point?.uuid),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Не удалось создать заказ: ${response.status}`);
      }

      console.log('Заказ успешно создан!');
      closeModalHandler();
      reset();
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      setError(error instanceof Error ? error.message : 'Не удалось создать заказ');
    }
  });

  const handleSetAdditionalPoints = (index: number, point: Point | null) => {
    setAdditionalPointsSelected((prev) => {
      const newPoints = [...prev];
      newPoints[index] = point;
      return newPoints;
    });
  };

  const getAvailablePoints = () => {
    return departurePoints.filter(
      (point) =>
        point.uuid !== departurePoint &&
        point.uuid !== arrivalPoint &&
        !additionalPointsSelected.some((p) => p?.uuid === point.uuid),
    );
  };

  return {
    selectedTariff,
    setSelectedTariff,
    selectedAdditionalServices,
    handleAdditionalServiceChangeCallback,
    handleCreateOrder,
    closeModalHandler,
    formMethods,
    departurePoint,
    arrivalPoint,
    departurePoints,
    arrivalPoints,
    getAvailablePoints,
    handleSetAdditionalPoints,
    additionalPointsSelected,
    isServiceAvailableForTariff, //Добавляем функцию в возвращаемый объект
  };
};

export default useCreateClientCorpOrder;
