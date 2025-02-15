const validateEmail = (value) => {
    const regex = /^\S+@\S+\.\S+$/;
    return regex.test(value) || 'Неверный формат почты';
};
export default validateEmail;
