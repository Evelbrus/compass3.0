'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Controller, useFormContext } from 'react-hook-form';
import { TextInput, PhoneInput, RadioInput } from '@shared/components/ui/inputs';
import { validatePhoneNumber } from '@shared/utils/validations';
const FIELD_FIRST_NAME = 'firstName';
const FIELD_LAST_NAME = 'lastName';
const FIELD_MIDDLE_NAME = 'middleName';
const FIELD_ADDRESS = 'address';
const FIELD_PHONE = 'phone';
const FIELD_GENDER = 'gender';
const RegisterStepTwo = () => {
    const { control, clearErrors } = useFormContext();
    return (_jsxs("div", { children: [_jsx(Controller, { name: FIELD_FIRST_NAME, control: control, defaultValue: "", rules: { required: 'Введите имя.' }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(TextInput, { label: "\u0418\u043C\u044F:", type: "text", value: typeof field.value === 'string' ? field.value : '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0438\u043C\u044F", error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_FIRST_NAME);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }), _jsx(Controller, { name: FIELD_LAST_NAME, control: control, defaultValue: "", rules: { required: 'Введите фамилию.' }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(TextInput, { label: "\u0424\u0430\u043C\u0438\u043B\u0438\u044F:", type: "text", value: typeof field.value === 'string' ? field.value : '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0444\u0430\u043C\u0438\u043B\u0438\u044E", error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_LAST_NAME);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }), _jsx(Controller, { name: FIELD_MIDDLE_NAME, control: control, defaultValue: "", render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(TextInput, { label: "\u041E\u0442\u0447\u0435\u0441\u0442\u0432\u043E:", type: "text", value: typeof field.value === 'string' ? field.value : '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043E\u0442\u0447\u0435\u0441\u0442\u0432\u043E", error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_MIDDLE_NAME);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }), _jsx(Controller, { name: FIELD_ADDRESS, control: control, defaultValue: "", rules: { required: 'Введите адрес.' }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(TextInput, { label: "\u0410\u0434\u0440\u0435\u0441:", type: "text", value: typeof field.value === 'string' ? field.value : '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441", error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_ADDRESS);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }), _jsx(Controller, { name: FIELD_PHONE, control: control, defaultValue: "", rules: {
                    required: 'Введите номер телефона.',
                    validate: (value) => validatePhoneNumber(value ?? '') || 'Некорректный номер телефона.',
                }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(PhoneInput, { label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D:", value: typeof field.value === 'string' ? field.value : '', error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_PHONE);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }), _jsx(Controller, { name: FIELD_GENDER, control: control, defaultValue: "Male", rules: { required: 'Выберите пол.' }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx("p", { className: "mb-1 font-semibold", children: "\u041F\u043E\u043B:" }), _jsxs("div", { className: "flex gap-4", children: [_jsx(RadioInput, { label: "\u041C\u0443\u0436\u0441\u043A\u043E\u0439", checked: field.value === 'Male', onChange: () => {
                                        clearErrors(FIELD_GENDER);
                                        field.onChange('Male');
                                    }, name: "gender" }), _jsx(RadioInput, { label: "\u0416\u0435\u043D\u0441\u043A\u0438\u0439", checked: field.value === 'Female', onChange: () => {
                                        clearErrors(FIELD_GENDER);
                                        field.onChange('Female');
                                    }, name: "gender" })] }), fieldState.error && (_jsx("p", { className: "text-red-500 text-sm mt-1", children: fieldState.error.message }))] })) })] }));
};
export default RegisterStepTwo;
