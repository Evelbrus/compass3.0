import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormContext, Controller } from 'react-hook-form';
import { Gender } from '@prisma/client';
import { TextInput, PhoneInput, RadioInput } from '@shared/components/ui/inputs';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
const ClientForm = ({ mode, profilePhotoPath, setPreview }) => {
    const { control, getValues, clearErrors } = useFormContext();
    return (_jsxs("div", { className: "flex flex-row justify-center p-5 bg-white border rounded-xl", children: [_jsx("div", { className: "w-2/3", children: _jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-4 p-6", children: [_jsx(Controller, { name: "firstName", control: control, defaultValue: "", rules: { required: 'Имя обязательно' }, render: ({ field, fieldState }) => (_jsx(TextInput, { label: "\u0418\u043C\u044F:", type: "text", value: field.value ?? '', onChange: (value) => {
                                    clearErrors('firstName');
                                    field.onChange(value);
                                }, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' })) }), _jsx(Controller, { name: "lastName", control: control, defaultValue: "", rules: { required: 'Фамилия обязательна' }, render: ({ field, fieldState }) => (_jsx(TextInput, { label: "\u0424\u0430\u043C\u0438\u043B\u0438\u044F:", type: "text", value: field.value ?? '', onChange: (value) => {
                                    clearErrors('lastName');
                                    field.onChange(value);
                                }, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' })) }), _jsx(Controller, { name: "middleName", control: control, defaultValue: "", render: ({ field, fieldState }) => (_jsx(TextInput, { label: "\u041E\u0442\u0447\u0435\u0441\u0442\u0432\u043E:", type: "text", value: field.value ?? '', onChange: (value) => {
                                    clearErrors('middleName');
                                    field.onChange(value);
                                }, error: !!fieldState.error, message: fieldState.error?.message || '' })) }), _jsx(Controller, { name: "email", control: control, defaultValue: "", rules: {
                                required: 'Email обязателен',
                                pattern: {
                                    value: /^\S+@\S+\.\S+$/,
                                    message: 'Некорректный email',
                                },
                            }, render: ({ field, fieldState }) => (_jsx(TextInput, { label: "Email:", type: "email", value: field.value ?? '', onChange: (value) => {
                                    clearErrors('email');
                                    field.onChange(value);
                                }, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' })) }), mode === 'create' && (_jsxs(_Fragment, { children: [_jsx(Controller, { name: "password", control: control, defaultValue: "", rules: { required: 'Пароль обязателен', validate: undefined }, render: ({ field, fieldState }) => (_jsx(TextInput, { label: "\u041F\u0430\u0440\u043E\u043B\u044C:", type: "password", value: field.value ?? '', onChange: (value) => {
                                            clearErrors('password');
                                            field.onChange(value);
                                        }, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' })) }), _jsx(Controller, { name: "confirmPassword", control: control, defaultValue: "", rules: {
                                        required: 'Подтверждение пароля обязательно',
                                        validate: (value) => value === getValues('password') || 'Пароли не совпадают',
                                    }, render: ({ field, fieldState }) => (_jsx(TextInput, { label: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u043B\u044F:", type: "password", value: field.value ?? '', onChange: (value) => {
                                            clearErrors('confirmPassword');
                                            field.onChange(value);
                                        }, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' })) })] })), _jsx(Controller, { name: "phone", control: control, defaultValue: "", rules: {
                                required: 'Телефон обязателен',
                                validate: undefined,
                            }, render: ({ field, fieldState }) => (_jsx(PhoneInput, { label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D:", value: field.value ?? '', onChange: (value) => {
                                    clearErrors('phone');
                                    field.onChange(value);
                                }, requiredStar: true, error: !!fieldState.error, message: fieldState.error?.message || '' })) }), _jsxs("div", { className: "relative col-span-2 flex flex-col gap-2", children: [_jsx("p", { className: "block text-sm font-medium text-gray-700", children: "\u041F\u043E\u043B:" }), _jsx("div", { className: "flex flex-row gap-4", children: _jsx(Controller, { name: "gender", control: control, defaultValue: Gender.Male, rules: { required: 'Выберите пол' }, render: ({ field, fieldState }) => {
                                            const handleGenderChange = (selected) => {
                                                clearErrors('gender');
                                                field.onChange(selected);
                                            };
                                            return (_jsxs("div", { className: "flex flex-row gap-4", children: [_jsx(RadioInput, { label: "\u041C\u0443\u0436\u0441\u043A\u043E\u0439", checked: field.value === Gender.Male, onChange: () => handleGenderChange(Gender.Male), name: "gender" }), _jsx(RadioInput, { label: "\u0416\u0435\u043D\u0441\u043A\u0438\u0439", checked: field.value === Gender.Female, onChange: () => handleGenderChange(Gender.Female), name: "gender" }), fieldState.error && (_jsx("p", { className: "text-red-600 text-sm mt-2", children: fieldState.error.message }))] }));
                                        } }) })] }), _jsx(Controller, { name: "address", control: control, defaultValue: "", rules: { required: 'Адрес обязателен' }, render: ({ field, fieldState }) => (_jsx(TextInput, { label: "\u0410\u0434\u0440\u0435\u0441:", type: "text", value: field.value ?? '', onChange: (value) => {
                                    clearErrors('address');
                                    field.onChange(value);
                                }, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' })) }), _jsx(Controller, { name: "availability", control: control, defaultValue: true, render: ({ field }) => (_jsxs("div", { className: "col-span-2 flex items-center gap-2", children: [_jsx("input", { type: "checkbox", id: "availability", checked: field.value, onChange: (e) => field.onChange(e.target.checked) }), _jsx("label", { htmlFor: "availability", className: "text-sm", children: "\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E\u0441\u0442\u044C" })] })) })] }) }), _jsx("div", { className: "w-1/3 flex flex-col items-center justify-start", children: _jsx(Controller, { name: "profileImage", control: control, render: ({ field, fieldState }) => (_jsx(ImageUploadWithCrop, { label: "\u0424\u043E\u0442\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u044F:", initialSrc: profilePhotoPath || undefined, required: false, error: !!fieldState.error, errorMessage: fieldState.error?.message || '', onChange: (file) => {
                            clearErrors('profileImage');
                            field.onChange(file);
                            if (file) {
                                const url = URL.createObjectURL(file);
                                setPreview(url);
                            }
                            else {
                                setPreview('');
                            }
                        }, containerWidth: 400, containerHeight: 350, aspect: 1 })) }) })] }));
};
export default ClientForm;
