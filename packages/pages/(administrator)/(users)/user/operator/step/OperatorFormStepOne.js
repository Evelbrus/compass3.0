import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Gender } from '@prisma/client';
import { useFormContext, Controller } from 'react-hook-form';
import { PhoneInput, RadioInput, TextInput } from '@shared/components/ui/inputs';
import { validateEmail, validateLength, validateNoSpecialChars, validatePassword, validatePhoneNumber, } from '@shared/utils/validations';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
const OperatorFormStepOne = ({ profilePhotoPath, mode, setPreview, }) => {
    const { control, getValues, clearErrors } = useFormContext();
    return (_jsxs("div", { className: "flex flex-row justify-center", children: [_jsx("div", { className: "w-2/3", children: _jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-4 p-6", children: [_jsx(Controller, { name: "lastName", control: control, defaultValue: "", rules: {
                                required: 'Фамилия обязательна',
                                validate: (value) => (validateLength(2, 50)(value) && validateNoSpecialChars(value)) ||
                                    'Некорректная фамилия',
                            }, render: ({ field, fieldState }) => {
                                const handleChange = (newValue) => {
                                    clearErrors('lastName');
                                    field.onChange(newValue ?? '');
                                };
                                return (_jsx(TextInput, { label: "\u0424\u0430\u043C\u0438\u043B\u0438\u044F:", type: "text", value: field.value ?? '', onChange: handleChange, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                            } }), _jsx(Controller, { name: "firstName", control: control, defaultValue: "", rules: {
                                required: 'Имя обязательно',
                                validate: (value) => (validateLength(2, 50)(value) && validateNoSpecialChars(value)) ||
                                    'Некорректное имя',
                            }, render: ({ field, fieldState }) => {
                                const handleChange = (newValue) => {
                                    clearErrors('firstName');
                                    field.onChange(newValue ?? '');
                                };
                                return (_jsx(TextInput, { label: "\u0418\u043C\u044F:", type: "text", value: field.value ?? '', onChange: handleChange, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                            } }), _jsx(Controller, { name: "middleName", control: control, defaultValue: "", render: ({ field, fieldState }) => {
                                const handleChange = (newValue) => {
                                    clearErrors('middleName');
                                    field.onChange(newValue ?? '');
                                };
                                return (_jsx(TextInput, { label: "\u041E\u0442\u0447\u0435\u0441\u0442\u0432\u043E:", type: "text", value: field.value ?? '', onChange: handleChange, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                            } }), _jsx(Controller, { name: "email", control: control, defaultValue: "", rules: { validate: validateEmail }, render: ({ field, fieldState }) => {
                                const handleChange = (newValue) => {
                                    clearErrors('email');
                                    field.onChange(newValue ?? '');
                                };
                                return (_jsx(TextInput, { label: "Email:", type: "email", value: field.value ?? '', onChange: handleChange, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                            } }), mode === 'create' && (_jsxs(_Fragment, { children: [_jsx(Controller, { name: "password", control: control, defaultValue: "", rules: {
                                        validate: (value) => validatePassword(value ?? ''),
                                    }, render: ({ field, fieldState }) => {
                                        const handleChange = (newValue) => {
                                            clearErrors('password');
                                            field.onChange(newValue ?? '');
                                        };
                                        return (_jsx(TextInput, { label: "\u041F\u0430\u0440\u043E\u043B\u044C:", type: "password", value: field.value ?? '', onChange: handleChange, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                                    } }), _jsx(Controller, { name: "confirmPassword", control: control, defaultValue: "", rules: {
                                        required: 'Подтверждение пароля обязательно',
                                        validate: (value) => value === getValues('password') || 'Пароли не совпадают',
                                    }, render: ({ field, fieldState }) => {
                                        const handleChange = (newValue) => {
                                            clearErrors('confirmPassword');
                                            field.onChange(newValue ?? '');
                                        };
                                        return (_jsx(TextInput, { label: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u043B\u044F:", type: "password", value: field.value ?? '', onChange: handleChange, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                                    } })] })), _jsx(Controller, { name: "phone", control: control, rules: { validate: validatePhoneNumber }, render: ({ field, fieldState }) => {
                                const handleChange = (newValue) => {
                                    clearErrors('phone');
                                    field.onChange(newValue ?? '');
                                };
                                return (_jsx(PhoneInput, { label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D:", ...field, onChange: handleChange, requiredStar: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                            } }), _jsxs("div", { className: "relative col-span-2 flex flex-col gap-2", children: [_jsx("p", { className: "block text-sm font-medium text-gray-700", children: "\u041F\u043E\u043B:" }), _jsx("div", { className: "flex flex-row gap-4", children: _jsx(Controller, { name: "gender", control: control, defaultValue: Gender.Male, rules: { required: 'Выберите пол.' }, render: ({ field, fieldState }) => {
                                            const handleGenderChange = (selected) => {
                                                clearErrors('gender');
                                                field.onChange(selected);
                                            };
                                            return (_jsxs("div", { className: "flex flex-row gap-4", children: [_jsx(RadioInput, { label: "\u041C\u0443\u0436\u0441\u043A\u043E\u0439", checked: field.value === Gender.Male, onChange: () => handleGenderChange(Gender.Male), name: "gender" }), _jsx(RadioInput, { label: "\u0416\u0435\u043D\u0441\u043A\u0438\u0439", checked: field.value === Gender.Female, onChange: () => handleGenderChange(Gender.Female), name: "gender" }), fieldState.error && (_jsx("p", { className: "text-red-600 text-sm mt-2", children: fieldState.error.message }))] }));
                                        } }) })] }), _jsx(Controller, { name: "address", control: control, defaultValue: "", render: ({ field, fieldState }) => {
                                const handleChange = (newValue) => {
                                    clearErrors('address');
                                    field.onChange(newValue ?? '');
                                };
                                return (_jsx(TextInput, { label: "\u0410\u0434\u0440\u0435\u0441:", type: "text", value: field.value ?? '', onChange: handleChange, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                            } })] }) }), _jsx("div", { className: "w-1/3 flex flex-col items-center justify-start", children: _jsx(Controller, { name: "profileImage", control: control, render: ({ field, fieldState }) => (_jsx(ImageUploadWithCrop, { label: "\u0424\u043E\u0442\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u044F:", initialSrc: profilePhotoPath || undefined, required: false, error: !!fieldState.error, errorMessage: fieldState.error?.message || '', onChange: (file) => {
                            clearErrors('profileImage');
                            field.onChange(file);
                            if (setPreview) {
                                if (file) {
                                    const url = URL.createObjectURL(file);
                                    setPreview(url);
                                }
                                else {
                                    setPreview('');
                                }
                            }
                        }, containerWidth: 400, containerHeight: 350, aspect: 1 })) }) })] }));
};
export default OperatorFormStepOne;
