export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  const month = `0${d.getMonth() + 1}`.slice(-2);
  const day = `0${d.getDate()}`.slice(-2);
  return `${d.getFullYear()}-${month}-${day}`;
};

export const formatDateCreateAuto = (date: Date | string): string => {
  return new Date(date).getFullYear().toString();
};
