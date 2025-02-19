'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Controller, useFormContext } from 'react-hook-form';
import { TextInput, PhoneInput } from '@shared/components/ui/inputs';
import { validateEmail } from '@shared/utils/validations';
const FIELD_COMPANY_PROFILE_COMPANY_NAME = 'companyProfile.companyName';
const FIELD_COMPANY_PROFILE_COMPANY_PIN = 'companyProfile.companyPin';
const FIELD_COMPANY_PROFILE_EMAIL = 'companyProfile.email';
const FIELD_COMPANY_PROFILE_PHONE = 'companyProfile.phone';
const FIELD_COMPANY_PROFILE_WEBSITE = 'companyProfile.website';
const FIELD_COMPANY_PROFILE_ADDRESS = 'companyProfile.address';
const RegisterStepThree = () => {
    const { control, clearErrors } = useFormContext();
    return (_jsxs("div", { children: [_jsx(Controller, { name: FIELD_COMPANY_PROFILE_COMPANY_NAME, control: control, defaultValue: "", rules: { required: 'Введите название компании.' }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(TextInput, { label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", type: "text", value: typeof field.value === 'string' ? field.value : '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438", error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_COMPANY_PROFILE_COMPANY_NAME);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }), _jsx(Controller, { name: FIELD_COMPANY_PROFILE_COMPANY_PIN, control: control, defaultValue: "", rules: { required: 'Введите PIN компании.' }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(TextInput, { label: "PIN \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", type: "text", value: typeof field.value === 'string' ? field.value : '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 PIN \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438", error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_COMPANY_PROFILE_COMPANY_PIN);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }), _jsx(Controller, { name: FIELD_COMPANY_PROFILE_EMAIL, control: control, defaultValue: "", rules: {
                    required: 'Введите email компании.',
                    validate: (value) => validateEmail(value ?? '') || 'Некорректный email.',
                }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(TextInput, { label: "Email \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", type: "email", value: typeof field.value === 'string' ? field.value : '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 email \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438", error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_COMPANY_PROFILE_EMAIL);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }), _jsx(Controller, { name: FIELD_COMPANY_PROFILE_PHONE, control: control, defaultValue: "", rules: { required: 'Введите телефон компании.' }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(PhoneInput, { label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", value: typeof field.value === 'string' ? field.value : '', error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_COMPANY_PROFILE_PHONE);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }), _jsx(Controller, { name: FIELD_COMPANY_PROFILE_WEBSITE, control: control, defaultValue: "", rules: { required: 'Введите сайт компании.' }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(TextInput, { label: "\u0421\u0430\u0439\u0442 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", type: "text", value: typeof field.value === 'string' ? field.value : '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0430\u0439\u0442 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438", error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_COMPANY_PROFILE_WEBSITE);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }), _jsx(Controller, { name: FIELD_COMPANY_PROFILE_ADDRESS, control: control, defaultValue: "", rules: { required: 'Введите адрес компании.' }, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(TextInput, { label: "\u0410\u0434\u0440\u0435\u0441 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", type: "text", value: typeof field.value === 'string' ? field.value : '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438", error: !!fieldState.error, onChange: (val) => {
                                clearErrors(FIELD_COMPANY_PROFILE_ADDRESS);
                                field.onChange(val === null ? '' : val);
                            } }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) })] }));
};
export default RegisterStepThree;
