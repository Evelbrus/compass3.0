'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Controller, useFormContext } from 'react-hook-form';
import { ImageUploadWithCrop } from '@shared/components/ui/images/ui/ImageUploadWithCrop';
const RegisterStepFour = ({ previewLogo, setPreviewLogo }) => {
    const { control, clearErrors } = useFormContext();
    return (_jsx("div", { children: _jsx(Controller, { name: "companyProfile.logoImage", control: control, render: ({ field, fieldState }) => (_jsxs("div", { className: "mb-4", children: [_jsx(ImageUploadWithCrop, { label: "\u041B\u043E\u0433\u043E\u0442\u0438\u043F \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438", initialSrc: previewLogo, required: false, error: !!fieldState.error, errorMessage: fieldState.error?.message || '', onChange: (file) => {
                            clearErrors('companyProfile.logoImage');
                            field.onChange(file);
                            //Если выбран новый файл, создаём URL для предпросмотра; иначе сбрасываем его
                            if (file && file instanceof File) {
                                const url = URL.createObjectURL(file);
                                setPreviewLogo(url);
                            }
                            else {
                                setPreviewLogo(undefined);
                            }
                        }, containerWidth: 400, containerHeight: 350, aspect: 1 }), fieldState.error && _jsx("p", { className: "text-red-500 text-sm", children: fieldState.error.message })] })) }) }));
};
export default RegisterStepFour;
