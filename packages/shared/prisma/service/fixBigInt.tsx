/**
 * Функция для рекурсивного преобразования BigInt в строку
 */
export function fixBigInt(value: any): any {
  if (Array.isArray(value)) {
    return value.map((v) => fixBigInt(v));
  } else if (value !== null && typeof value === 'object') {
    const newObj: Record<string, any> = {};
    for (const key in value) {
      newObj[key] = fixBigInt(value[key]);
    }
    return newObj;
  } else if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}
