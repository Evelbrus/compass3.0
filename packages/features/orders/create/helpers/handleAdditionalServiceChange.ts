export const handleAdditionalServiceChange = (
  checked: boolean,
  serviceUuid: string,
  selectedAdditionalServices: string[],
): string[] => {
  return checked
    ? [...selectedAdditionalServices, serviceUuid]
    : selectedAdditionalServices.filter((uuid) => uuid !== serviceUuid);
};
