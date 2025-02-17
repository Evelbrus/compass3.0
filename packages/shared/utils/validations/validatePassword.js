const validatePassword = (value) => {
    const regex = /^(?=.*\d).{6,}$/;
    return regex.test(value) || 'Пароль должен содержать не менее 6 символов и хотя бы одну цифру';
};
export default validatePassword;
