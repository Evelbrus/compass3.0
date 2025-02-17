/**
 * Type guard, если нужно проверить тарифную опцию
 */
export function isOptionTariff(option) {
    return option.maxPeople !== undefined;
}
