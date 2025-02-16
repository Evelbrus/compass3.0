const validateNoSpecialChars = (value) => {
    if (!value || value.trim() === '') {
        return true;
    }
    const regex = /^[a-zA-Zа-яА-Я0-9\s.,'-]+$/;
    return regex.test(value) || 'Поле содержит недопустимые символы';
};
export default validateNoSpecialChars;
