'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState, useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { IButton } from '@shared/components/ui/buttons';
import { LazyImage } from '@shared/components/ui/images';
export const ImageUpload = ({ name, label, defaultImage, maxWidth = 1024, maxHeight = 1024, error = false, message = '', className = '', placeholder = '/placeholderImage.png', passportPhoto = false, licensePhoto = false, value, readonly = false, requiredStar = false, }) => {
    const { control, setValue } = useFormContext();
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(value || defaultImage || null);
    const [internalError, setInternalError] = useState(null);
    const file = useWatch({ name, control });
    useEffect(() => {
        if (file && file instanceof File) {
            //Добавлена проверка file && ...
            const url = URL.createObjectURL(file);
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        }
        else {
            setPreview(value || defaultImage || null);
        }
    }, [file, value, defaultImage]);
    const handleUpload = (event) => {
        setInternalError(null);
        if (event.target.files && event.target.files.length > 0) {
            const selectedFile = event.target.files[0];
            const url = URL.createObjectURL(selectedFile);
            const img = new Image();
            img.src = url;
            img.onload = () => {
                if (img.width > maxWidth || img.height > maxHeight) {
                    setInternalError(`Размер изображения не должен превышать ${maxWidth}x${maxHeight}px.`);
                    URL.revokeObjectURL(url);
                    setValue(name, undefined);
                    return;
                }
                setValue(name, selectedFile);
            };
            img.onerror = () => {
                setInternalError('Ошибка загрузки изображения. Попробуйте другой файл.');
                URL.revokeObjectURL(url);
                setValue(name, undefined);
            };
        }
    };
    const handleRemove = () => {
        if (preview && !readonly) {
            URL.revokeObjectURL(preview);
            setPreview(defaultImage || null);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
            setValue(name, undefined);
        }
    };
    return (_jsxs("div", { className: `w-full flex flex-col ${className}`, children: [_jsxs("label", { className: "text-5 leading-5 text-gray-500 font-extrabold mb-3 flex justify-center", children: [label, " ", requiredStar && _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "w-full min-h-fit border-2 border-dashed border-gray-400 rounded-lg flex flex-col gap-4 items-center justify-center bg-white overflow-hidden relative", children: [preview ? (_jsxs(_Fragment, { children: [_jsx("img", { src: preview, alt: "\u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F", className: "w-full object-cover rounded-lg p-1", style: { height: licensePhoto || passportPhoto ? '150px' : '260px' } }), !readonly && (_jsx(IButton, { type: "button", onClick: handleRemove, className: "absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700", children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" }))] })) : (_jsx(LazyImage, { src: placeholder, alt: "\u041F\u043B\u0435\u0439\u0441\u0445\u043E\u043B\u0434\u0435\u0440", className: "w-[200px] h-[200px]" })), !readonly && (_jsx("div", { className: "relative flex flex-col gap-2 pb-4", children: _jsx(IButton, { type: "button", onClick: () => inputRef.current?.click(), className: "px-6 py-2 bg-gray-600 text-white rounded-lg", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u043E\u0442\u043E" }) })), !readonly && (_jsx("input", { type: "file", accept: "image/*", onChange: handleUpload, ref: inputRef, className: "hidden" }))] }), internalError && _jsx("p", { className: "text-red-500 text-center mt-2", children: internalError }), error && message && _jsx("p", { className: "text-red-500 text-center mt-2", children: message })] }));
};
ImageUpload.displayName = 'ImageUpload';
