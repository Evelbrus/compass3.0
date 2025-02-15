/**Преобразует BigInt в строку, Date в ISO-формат и устраняет ошибки сериализации */
const convertPrismaData = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString() as unknown as T;
  }

  if (obj instanceof Date) {
    return obj.toISOString() as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertPrismaData) as unknown as T;
  }

  if (typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, convertPrismaData(value)]),
    ) as T;
  }

  return obj;
};

export default convertPrismaData;
