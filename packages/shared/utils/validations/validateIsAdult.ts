import { subYears, isBefore } from 'date-fns';

const validateIsAdult = (age: number = 18) => {
  return (value: Date | string | null | undefined): boolean | string => {
    if (!value) {
      return 'Дата рождения обязательна';
    }

    const birthDate = typeof value === 'string' ? new Date(value) : value;
    const today = new Date();
    const cutoffDate = subYears(today, age);

    if (isBefore(birthDate, cutoffDate)) {
      return true;
    }

    return `Возраст должен быть не менее ${age} лет`;
  };
};

export default validateIsAdult;
