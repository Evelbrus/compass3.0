/**Преобразует BigInt в строку, Date в ISO-формат и устраняет ошибки сериализации */
const convertPrismaData = (obj) => {
    if (obj === null || obj === undefined) {
        return obj;
    }
    if (typeof obj === 'bigint') {
        return obj.toString();
    }
    if (obj instanceof Date) {
        return obj.toISOString();
    }
    if (Array.isArray(obj)) {
        return obj.map(convertPrismaData);
    }
    if (typeof obj === 'object') {
        return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, convertPrismaData(value)]));
    }
    return obj;
};
export default convertPrismaData;
