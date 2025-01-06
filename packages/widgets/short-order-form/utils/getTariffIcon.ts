import { iconsMap } from '@widgets/short-order-form';

export const getTariffIcon = (value: string) => {
  return iconsMap[value] || null;
};
