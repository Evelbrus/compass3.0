const validateLength =
  (min: number, max?: number) =>
  (value: number | string | undefined): true | string => {
    if (value === undefined || value === null) {
      return `Значение не может быть пустым`;
    }

    const strValue = typeof value === 'number' ? value.toString() : value;
    const length = strValue.length;

    if (length < min) {
      return `Минимальная длина ${min} символов`;
    }

    if (max !== undefined && length > max) {
      return `Максимальная длина ${max} символов`;
    }

    return true;
  };

export default validateLength;
