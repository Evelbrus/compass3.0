const validateOnlyDigits = (value: number | string): true | string => {
  const strValue = typeof value === 'number' ? value.toString() : value;
  const regex = /^\d+$/;
  return regex.test(strValue) || 'Поле должно содержать только цифры';
};

export default validateOnlyDigits;
