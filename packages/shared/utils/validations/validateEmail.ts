const validateEmail = (value: string | undefined) => {
  if (!value) return 'Email обязателен';

  const regex = /^\S+@\S+\.\S+$/;
  return regex.test(value) || 'Неверный формат почты';
};

export default validateEmail;