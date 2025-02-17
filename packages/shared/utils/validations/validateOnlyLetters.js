const validateOnlyLetters = (value) => {
    const regex = /^[a-zA-Zа-яА-Я\s'-]+$/;
    return regex.test(value) || 'Поле должно содержать только буквы';
};
export default validateOnlyLetters;
