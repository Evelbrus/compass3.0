import { TariffResponse } from '@shared/lib/effector/tariff/interface/interface';

export interface TariffProps {
  tariff: TariffResponse;
  lang: string;
  isAuthenticated: boolean;
}
