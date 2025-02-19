import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput, SelectSingle } from '@shared/components/ui/inputs';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
import { citizenshipOptions, partnerOptions, } from '@shared/lib/effector/drivers/optionsTranslation/optionsTranslationDriver';
import { identityDocumentOptions } from '@shared/lib/effector/drivers/optionsTranslation/optionsTranslationDriver';
import { changingDriverOptions } from '@shared/lib/effector/drivers/optionsTranslation/optionsTranslationDriver';
//Определяем константы для имен полей.
const FIELD_CITIZENSHIP = 'driverProfile.citizenship';
const FIELD_IDENTITY_DOCUMENT = 'driverProfile.identityDocument';
const FIELD_PASSPORT_ID = 'driverProfile.passportId';
const FIELD_PASSPORT_ISSUE_DATE = 'driverProfile.passportIssueDate';
const FIELD_PASSPORT_ISSUED = 'driverProfile.passportIssued';
const FIELD_BIRTH_DATE = 'driverProfile.birthDate';
const FIELD_BIRTH_PLACE = 'driverProfile.birthPlace';
const FIELD_ACTUAL_ADDRESS = 'driverProfile.actualAddress';
const FIELD_PERMANENT_ADDRESS = 'driverProfile.permanentAddress';
const FIELD_CHANGING_DRIVER = 'driverProfile.changingDriver';
const FIELD_PASSPORT_IMAGE = 'driverProfile.passportImage';
const FIELD_DRIVER_PROFILE_IMAGE = 'driverProfile.driverProfileImage';
const FIELD_PARTNER_COMPANY = 'partnerCompany';
const FIELD_INDIVIDUAL_SALARY_RATE = 'individualSalaryRate';
//Функция форматирования даты в "YYYY-MM-DD"
function formatDate(value) {
    if (!value) {
        return '';
    }
    if (typeof value === 'string') {
        return value;
    }
    if (value instanceof Date) {
        return value.toISOString().substring(0, 10);
    }
    return '';
}
const DriverFormStepTwo = ({ passportPhotoSrc, driverProfilePhotoSrc, setPassportPreview, setDriverProfilePhotoPreview, }) => {
    const { control, clearErrors } = useFormContext();
    return (_jsxs("div", { className: "flex flex-row flex-wrap justify-center", children: [_jsxs("div", { className: "w-2/3", children: [_jsx("h3", { className: "text-lg font-semibold px-6 mt-4", children: "\u041B\u0438\u0447\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u0438 \u043F\u0430\u0441\u043F\u043E\u0440\u0442\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435" }), _jsxs("div", { className: "grid grid-cols-2 gap-x-8 gap-y-4 p-6", children: [_jsx(Controller, { name: FIELD_CITIZENSHIP, control: control, defaultValue: citizenshipOptions[1]?.value || 'KG', rules: { required: 'Гражданство обязательно' }, render: ({ field, fieldState }) => {
                                    const selectedOption = citizenshipOptions.find((opt) => opt.value === field.value) || null;
                                    //Обработчик onChange для гражданства
                                    const handleSelectChange = (option) => {
                                        clearErrors(FIELD_CITIZENSHIP);
                                        field.onChange(option?.value ?? '');
                                    };
                                    return (_jsx(SelectSingle, { label: "\u0413\u0440\u0430\u0436\u0434\u0430\u043D\u0441\u0442\u0432\u043E", options: citizenshipOptions, value: selectedOption, onChange: handleSelectChange, error: !!fieldState.error, message: fieldState.error?.message || '', requiredStar: true, placeholder: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0433\u0440\u0430\u0436\u0434\u0430\u043D\u0441\u0442\u0432\u043E" }));
                                } }), _jsx(Controller, { name: FIELD_IDENTITY_DOCUMENT, control: control, defaultValue: identityDocumentOptions[1]?.value || 'Kyrgyzstan', rules: { required: 'Документ удостоверения обязателен' }, render: ({ field, fieldState }) => {
                                    //Приводим опции, чтобы label всегда был строкой, аналогично гражданству
                                    const normalizedOptions = identityDocumentOptions.map((opt) => ({
                                        ...opt,
                                        label: opt.label ? String(opt.label) : '',
                                    }));
                                    const selectedOption = normalizedOptions.find((opt) => opt.value === field.value) || null;
                                    //Обработчик onChange для документа удостоверения
                                    const handleSelectChange = (option) => {
                                        clearErrors(FIELD_IDENTITY_DOCUMENT);
                                        field.onChange(option?.value ?? '');
                                    };
                                    return (_jsx(SelectSingle, { label: "\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442 \u0443\u0434\u043E\u0441\u0442\u043E\u0432\u0435\u0440\u0435\u043D\u0438\u044F", options: normalizedOptions, value: selectedOption, onChange: handleSelectChange, error: !!fieldState.error, message: fieldState.error?.message || '', requiredStar: true, placeholder: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442" }));
                                } }), _jsx(Controller, { name: FIELD_PASSPORT_ID, control: control, rules: { required: 'Номер паспорта обязателен' }, render: ({ field, fieldState }) => {
                                    const handleChange = (newValue) => {
                                        clearErrors(FIELD_PASSPORT_ID);
                                        field.onChange(newValue === null ? '' : newValue);
                                    };
                                    return (_jsx(TextInput, { label: "\u041D\u043E\u043C\u0435\u0440 \u043F\u0430\u0441\u043F\u043E\u0440\u0442\u0430:", type: "number", value: field.value, onChange: handleChange, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                                } }), _jsx(Controller, { name: FIELD_PASSPORT_ISSUE_DATE, control: control, rules: { required: 'Дата выдачи паспорта обязательна' }, render: ({ field, fieldState }) => {
                                    const handleChange = (newValue) => {
                                        clearErrors(FIELD_PASSPORT_ISSUE_DATE);
                                        field.onChange(newValue === null ? '' : newValue);
                                    };
                                    return (_jsx(TextInput, { label: "\u0414\u0430\u0442\u0430 \u0432\u044B\u0434\u0430\u0447\u0438 \u043F\u0430\u0441\u043F\u043E\u0440\u0442\u0430:", type: "date", value: formatDate(field.value), onChange: handleChange, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                                } }), _jsx(Controller, { name: FIELD_PASSPORT_ISSUED, control: control, rules: { required: 'Поле "Кем выдан паспорт" обязательно' }, render: ({ field, fieldState }) => {
                                    const handleChange = (newValue) => {
                                        clearErrors(FIELD_PASSPORT_ISSUED);
                                        field.onChange(newValue === null ? '' : String(newValue));
                                    };
                                    return (_jsx(TextInput, { label: "\u041A\u0435\u043C \u0432\u044B\u0434\u0430\u043D \u043F\u0430\u0441\u043F\u043E\u0440\u0442:", type: "text", value: field.value ?? '', onChange: handleChange, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                                } }), _jsx(Controller, { name: FIELD_BIRTH_DATE, control: control, rules: { required: 'Дата рождения обязательна' }, render: ({ field, fieldState }) => {
                                    const handleChange = (newValue) => {
                                        clearErrors(FIELD_BIRTH_DATE);
                                        field.onChange(newValue === null ? '' : newValue);
                                    };
                                    return (_jsx(TextInput, { label: "\u0414\u0430\u0442\u0430 \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F:", type: "date", value: formatDate(field.value), onChange: handleChange, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                                } }), _jsx(Controller, { name: FIELD_BIRTH_PLACE, control: control, rules: { required: 'Место рождения обязательно' }, render: ({ field, fieldState }) => {
                                    const handleChange = (newValue) => {
                                        clearErrors(FIELD_BIRTH_PLACE);
                                        field.onChange(newValue === null ? '' : newValue);
                                    };
                                    return (_jsx(TextInput, { label: "\u041C\u0435\u0441\u0442\u043E \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F:", type: "text", value: field.value ?? '', onChange: handleChange, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                                } }), _jsx(Controller, { name: FIELD_ACTUAL_ADDRESS, control: control, render: ({ field, fieldState }) => {
                                    const handleChange = (newValue) => {
                                        clearErrors(FIELD_ACTUAL_ADDRESS);
                                        field.onChange(newValue === null ? '' : newValue);
                                    };
                                    return (_jsx(TextInput, { label: "\u0424\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0430\u0434\u0440\u0435\u0441:", type: "text", value: field.value ?? '', onChange: handleChange, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                                } }), _jsx(Controller, { name: FIELD_PERMANENT_ADDRESS, control: control, rules: { required: 'Постоянный адрес обязателен' }, render: ({ field, fieldState }) => {
                                    const handleChange = (newValue) => {
                                        clearErrors(FIELD_PERMANENT_ADDRESS);
                                        field.onChange(newValue === null ? '' : newValue);
                                    };
                                    return (_jsx(TextInput, { label: "\u041F\u043E\u0441\u0442\u043E\u044F\u043D\u043D\u044B\u0439 \u0430\u0434\u0440\u0435\u0441:", type: "text", value: field.value ?? '', onChange: handleChange, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                                } }), _jsx(Controller, { name: FIELD_CHANGING_DRIVER, control: control, rules: { required: 'Режим смены обязателен' }, render: ({ field, fieldState }) => {
                                    //Приводим опции, чтобы label всегда был строкой, аналогично гражданству
                                    const normalizedOptions = changingDriverOptions.map((opt) => ({
                                        ...opt,
                                        label: opt.label ? String(opt.label) : '',
                                    }));
                                    const selectedOption = normalizedOptions.find((opt) => opt.value === field.value) || null;
                                    //Обработчик onChange для режима смены
                                    const handleSelectChange = (option) => {
                                        clearErrors(FIELD_CHANGING_DRIVER);
                                        field.onChange(option?.value ?? '');
                                    };
                                    return (_jsx(SelectSingle, { label: "\u0420\u0435\u0436\u0438\u043C \u0441\u043C\u0435\u043D\u044B", options: normalizedOptions, value: selectedOption, onChange: handleSelectChange, error: !!fieldState.error, message: fieldState.error?.message || '', requiredStar: true, placeholder: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0440\u0435\u0436\u0438\u043C" }));
                                } }), _jsx(Controller, { name: FIELD_PARTNER_COMPANY, control: control, defaultValue: "NONE", rules: { required: 'Партнер обязателен' }, render: ({ field, fieldState }) => {
                                    const selectedOption = partnerOptions.find((opt) => opt.value === field.value) || null;
                                    const handleSelectChange = (option) => {
                                        clearErrors(FIELD_PARTNER_COMPANY);
                                        field.onChange(option?.value ?? 'NONE');
                                    };
                                    return (_jsx(SelectSingle, { label: "\u041F\u0430\u0440\u0442\u043D\u0435\u0440", options: partnerOptions, value: selectedOption, onChange: handleSelectChange, error: !!fieldState.error, message: fieldState.error?.message || '', requiredStar: true, placeholder: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u0430\u0440\u0442\u043D\u0435\u0440\u0430" }));
                                } }), _jsx(Controller, { name: FIELD_INDIVIDUAL_SALARY_RATE, control: control, render: ({ field, fieldState }) => {
                                    const handleChange = (newValue) => {
                                        clearErrors(FIELD_INDIVIDUAL_SALARY_RATE);
                                        field.onChange(newValue === null ? '' : Number(newValue) || null);
                                    };
                                    return (_jsx(TextInput, { label: "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0442\u0430\u0432\u043A\u0430:", type: "number", value: field.value ?? '', onChange: handleChange, error: !!fieldState.error, message: fieldState.error?.message || '', placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0441\u0443\u043C\u043C\u0443" }));
                                } })] })] }), _jsxs("div", { className: "w-1/3 flex flex-col items-center justify-around", children: [_jsx(Controller, { name: FIELD_PASSPORT_IMAGE, control: control, render: ({ field, fieldState }) => (_jsx(ImageUploadWithCrop, { label: "\u041B\u0438\u0446\u0435\u0432\u0430 \u0441\u0442\u043E\u0440\u043E\u043D\u0430 \u043F\u0430\u0441\u043F\u043E\u0440\u0442\u0430:", initialSrc: passportPhotoSrc || undefined, error: !!fieldState.error, errorMessage: fieldState.error?.message || '', onChange: (file) => {
                                clearErrors(FIELD_PASSPORT_IMAGE);
                                field.onChange(file);
                                if (setPassportPreview) {
                                    if (file) {
                                        const url = URL.createObjectURL(file);
                                        setPassportPreview(url);
                                    }
                                    else {
                                        setPassportPreview('');
                                    }
                                }
                            }, containerWidth: 300, containerHeight: 200, aspect: 4 / 3 })) }), _jsx(Controller, { name: FIELD_DRIVER_PROFILE_IMAGE, control: control, render: ({ field, fieldState }) => (_jsx(ImageUploadWithCrop, { label: "\u0417\u0430\u0434\u043D\u044F\u044F \u0441\u0442\u043E\u0440\u043E\u043D\u0430 \u043F\u0430\u0441\u043F\u043E\u0440\u0442\u0430:", initialSrc: driverProfilePhotoSrc || undefined, error: !!fieldState.error, errorMessage: fieldState.error?.message || '', onChange: (file) => {
                                clearErrors(FIELD_DRIVER_PROFILE_IMAGE);
                                field.onChange(file);
                                if (setDriverProfilePhotoPreview) {
                                    if (file) {
                                        const url = URL.createObjectURL(file);
                                        setDriverProfilePhotoPreview(url);
                                    }
                                    else {
                                        setDriverProfilePhotoPreview('');
                                    }
                                }
                            }, containerWidth: 300, containerHeight: 200, aspect: 4 / 3 })) })] })] }));
};
export default DriverFormStepTwo;
