import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput, PhoneInput } from '@shared/components/ui/inputs';
import { validateEmail, validateLength, validateNoSpecialChars, validatePhoneNumber, } from '@shared/utils/validations';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
const OperatorFormStepTwo = ({ setLogoPreview, logoImageSrc, }) => {
    const { control, clearErrors } = useFormContext();
    return (_jsxs("div", { className: "flex flex-row justify-center", children: [_jsx("div", { className: "w-2/3", children: _jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-4 p-6", children: [_jsx(Controller, { name: "companyProfile.companyName", control: control, defaultValue: "", rules: {
                                required: 'Название компании обязательно',
                                validate: (value) => (validateLength(2, 100)(value) && validateNoSpecialChars(value)) ||
                                    'Некорректное название компании',
                            }, render: ({ field, fieldState }) => (_jsx(TextInput, { label: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", type: "text", value: field.value ?? '', onChange: (newValue) => field.onChange(newValue ?? ''), required: true, error: !!fieldState.error, message: fieldState.error?.message || '' })) }), _jsx(Controller, { name: "companyProfile.address", control: control, defaultValue: "", rules: {
                                required: 'Адрес компании обязателен',
                                validate: (value) => validateLength(5, 200)(value) || 'Адрес компании слишком короткий',
                            }, render: ({ field, fieldState }) => (_jsx(TextInput, { label: "\u0410\u0434\u0440\u0435\u0441 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", type: "text", value: field.value ?? '', onChange: (newValue) => field.onChange(newValue ?? ''), required: true, error: !!fieldState.error, message: fieldState.error?.message || '' })) }), _jsx(Controller, { name: "companyProfile.phone", control: control, defaultValue: "", rules: {
                                required: 'Телефон компании обязателен',
                                validate: validatePhoneNumber,
                            }, render: ({ field, fieldState }) => (_jsx(PhoneInput, { label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", value: field.value ?? '', onChange: (newValue) => field.onChange(newValue ?? ''), requiredStar: true, error: !!fieldState.error, message: fieldState.error?.message || '' })) }), _jsx(Controller, { name: "companyProfile.email", control: control, defaultValue: "", rules: {
                                required: 'Email компании обязателен',
                                validate: validateEmail,
                            }, render: ({ field, fieldState }) => (_jsx(TextInput, { label: "Email \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", type: "email", value: field.value ?? '', onChange: (newValue) => field.onChange(newValue ?? ''), required: true, error: !!fieldState.error, message: fieldState.error?.message || '' })) }), _jsx(Controller, { name: "companyProfile.website", control: control, defaultValue: "", rules: {
                            //При необходимости можно добавить валидацию сайта
                            //Например:
                            //validate: (value) =>
                            ///^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value) ||
                            //'Некорректный URL'
                            }, render: ({ field, fieldState }) => (_jsx(TextInput, { label: "\u0421\u0430\u0439\u0442 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", type: "url", value: field.value ?? '', onChange: (newValue) => field.onChange(newValue ?? ''), error: !!fieldState.error, message: fieldState.error?.message || '' })) }), _jsx(Controller, { name: "companyProfile.companyPin", control: control, defaultValue: "", rules: {
                                required: 'PIN компании обязателен',
                                validate: (value) => (validateLength(2, 100)(value ?? '') && validateNoSpecialChars(value ?? '')) ||
                                    'Некорректное название компании',
                            }, render: ({ field, fieldState }) => (_jsx(TextInput, { label: "PIN \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", type: "text", value: field.value ?? '', onChange: (newValue) => field.onChange(newValue ?? ''), required: true, error: !!fieldState.error, message: fieldState.error?.message || '' })) })] }) }), _jsx("div", { className: "w-1/3 flex flex-col items-center justify-start p-6", children: _jsx(Controller, { name: "companyProfile.logoImage", control: control, render: ({ field, fieldState }) => (_jsx(ImageUploadWithCrop, { label: "\u041B\u043E\u0433\u043E\u0442\u0438\u043F \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438:", initialSrc: logoImageSrc || undefined, required: false, error: !!fieldState.error, errorMessage: fieldState.error?.message || '', onChange: (file) => {
                            clearErrors('companyProfile.logoImage');
                            field.onChange(file);
                            if (file) {
                                const url = URL.createObjectURL(file);
                                setLogoPreview(url);
                            }
                            else {
                                setLogoPreview('');
                            }
                        }, containerWidth: 400, containerHeight: 350, aspect: 1 })) }) })] }));
};
export default OperatorFormStepTwo;
