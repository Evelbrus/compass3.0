import { useState, useEffect, useCallback } from 'react';
import { AdditionalService } from '@prisma/client';
import { useApi } from '@shared/components/modal/create-client-corp-order/api/useApi';
import { DetailTariffData } from '@shared/prisma/interface/tariff/interface';
import { TariffAdditionalService } from '@shared/prisma/interface/orders/interface';

interface UseTariffAndServicesReturn {
  tariffs: DetailTariffData[];
  additionalServices: AdditionalService[];
  loading: boolean;
  error: string | null;
  isServiceAvailableForTariff: (serviceUuid: string) => TariffAdditionalService | undefined;
}

const useTariffAndServices = (selectedTariff: string): UseTariffAndServicesReturn => {
  const [tariffs, setTariffs] = useState<DetailTariffData[]>([]);
  const [additionalServices, setAdditionalServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchTariffs, fetchAdditionalServices } = useApi();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [tariffsData, additionalServicesData] = await Promise.all([
          fetchTariffs(),
          fetchAdditionalServices(),
        ]);
        setTariffs(tariffsData);
        setAdditionalServices(additionalServicesData);
        setError(null);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [fetchTariffs, fetchAdditionalServices]);

  const isServiceAvailableForTariff = useCallback(
    (serviceUuid: string): TariffAdditionalService | undefined => {
      const selectedTariffData = tariffs.find((tariff) => tariff.uuid === selectedTariff);
      if (selectedTariffData && selectedTariffData.tariffAdditionalServices) {
        return selectedTariffData.tariffAdditionalServices.find(
          (tas) => tas.serviceUuid === serviceUuid,
        );
      }
      return undefined;
    },
    [selectedTariff, tariffs],
  );

  return {
    tariffs,
    additionalServices,
    loading,
    error,
    isServiceAvailableForTariff,
  };
};

export default useTariffAndServices;
