import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFormContext, Controller } from 'react-hook-form';
import { TextInput } from '@shared/components/ui/inputs';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
//Константы для имен полей:
const FIELD_YEARS_OF_DRIVING = 'driverProfile.yearsOfDriving';
const FIELD_LICENSE_IMAGE = 'driverProfile.licenseImage';
const DriverFormStepThree = ({ licenseSrc, setLicensePreview, }) => {
    const { control, clearErrors } = useFormContext();
    return (_jsxs("div", { className: "flex flex-row justify-center", children: [_jsxs("div", { className: "w-2/3", children: [_jsx("h3", { className: "text-lg font-semibold px-6 mt-4", children: "\u0421\u0442\u0430\u0436 \u0432\u043E\u0436\u0434\u0435\u043D\u0438\u044F \u0438 \u0442\u0435\u0445\u043F\u0430\u0441\u043F\u043E\u0440\u0442" }), _jsx("div", { className: "grid grid-cols-1 gap-x-8 gap-y-4 p-6", children: _jsx(Controller, { name: FIELD_YEARS_OF_DRIVING, control: control, rules: {
                                required: 'Стаж вождения обязателен',
                                min: {
                                    value: 0,
                                    message: 'Стаж не может быть отрицательным',
                                },
                            }, render: ({ field, fieldState }) => {
                                //Изменён тип параметра handleChange
                                const handleChange = (newValue) => {
                                    clearErrors(FIELD_YEARS_OF_DRIVING);
                                    field.onChange(newValue === null ? '' : Number(newValue) || null);
                                };
                                return (_jsx(TextInput, { label: "\u0421\u0442\u0430\u0436 \u0432\u043E\u0436\u0434\u0435\u043D\u0438\u044F (\u043B\u0435\u0442):", type: "number", value: field.value, onChange: handleChange, required: true, error: !!fieldState.error, message: fieldState.error?.message || '' }));
                            } }) })] }), _jsx("div", { className: "w-1/3 flex flex-col items-center justify-start", children: _jsx(Controller, { name: FIELD_LICENSE_IMAGE, control: control, render: ({ field, fieldState }) => (_jsx(ImageUploadWithCrop, { label: "\u0424\u043E\u0442\u043E \u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043F\u0430\u0441\u043F\u043E\u0440\u0442\u0430:", initialSrc: licenseSrc || undefined, error: !!fieldState.error, errorMessage: fieldState.error?.message || '', onChange: (file) => {
                            clearErrors(FIELD_LICENSE_IMAGE);
                            field.onChange(file);
                            //Обновляем превью, если файл выбран
                            if (file && setLicensePreview) {
                                const url = URL.createObjectURL(file);
                                setLicensePreview(url);
                            }
                        }, containerWidth: 300, containerHeight: 200, aspect: 4 / 3 })) }) })] }));
};
export default DriverFormStepThree;
