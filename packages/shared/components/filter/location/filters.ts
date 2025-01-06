import { OptionLocation } from '@shared/lib/effector';

export const filterLocationOptions = <T extends string | number>(
  options: OptionLocation<T>[],
  excludedValue: T | undefined | null,
): OptionLocation<T>[] => {
  return options.filter((option) => option.value !== excludedValue);
};
