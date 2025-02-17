'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import Cropper from 'react-easy-crop';
import ModalFullImage from '@shared/components/ui/images/ui/ModalFullImage';
import { useImageEditor } from '@shared/components/ui/images/hooks/useImageEditor';
export const ImageUploadWithCrop = ({ initialSrc, required = false, error = false, errorMessage = '', onChange, label = 'Фото:', className = '', containerWidth = 400, containerHeight = 350, aspect = 1, }) => {
    //Подключаем наш хук с редактором изображений
    const { originalPreview, localPreview, internalError, showCropper, crop, zoom, showFullImage, inputRef, handleImageChange, handleRemove, onCropComplete, handleCropSave, handleResetCrop, setShowCropper, setCrop, setZoom, setShowFullImage, } = useImageEditor(initialSrc, (croppedUrl) => {
        //Когда сохраняем кроп, можно что-то делать (например, передавать наверх)
        //Но чаще нужно просто обновить превью. В хукe это уже делается.
        //Если нужно отдать файл родителю, нужно дополнительно вызвать onChange(...),
        //но там будет Blob, поэтому можно либо конвертировать, либо хранить base64 и т.д.
    });
    //Обёртка, чтобы при смене файла сообщить родителю
    const handleInputChange = (e) => {
        handleImageChange(e);
        //Если нужно тут же «сбрасывать ошибку» — можно это делать:
        //clearErrors('имяПоля');
        //А ещё можно:
        if (onChange) {
            const file = e.target.files?.[0] || null;
            onChange(file);
        }
    };
    //Обёртка для handleRemove, чтобы родитель знал, что мы убрали файл
    const handleRemoveClick = () => {
        handleRemove();
        if (onChange) {
            onChange(null);
        }
    };
    return (_jsxs("div", { className: `w-full flex flex-col items-center justify-start p-6 ${className}`, children: [_jsxs("label", { className: "block text-4 font-medium text-gray-500 mb-2", children: [label, required && _jsx("span", { className: "text-red-500 ml-1", children: "*" })] }), _jsx("div", { className: "w-full border-2 border-dashed border-gray-400 rounded-lg bg-white overflow-hidden relative", style: { height: containerHeight }, children: localPreview ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "absolute top-2 left-2 flex flex-row gap-2", children: [_jsx("button", { type: "button", onClick: () => setShowFullImage(true), className: "bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700 text-xs", children: "\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E" }), _jsx("button", { type: "button", onClick: () => setShowCropper(true), className: "bg-green-500 text-white px-2 py-1 rounded hover:bg-green-700 text-xs", children: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0440\u0430\u043A\u0443\u0440\u0441" })] }), _jsx("div", { className: "absolute top-10 left-2 flex flex-row gap-2", children: _jsx("button", { type: "button", onClick: handleResetCrop, className: "bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-xs", children: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C" }) }), showCropper && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75", children: _jsxs("div", { className: "relative bg-white p-4 rounded", children: [_jsx("div", { className: "w-[300px] h-[300px] relative", children: _jsx(Cropper, { image: originalPreview || localPreview, crop: crop, zoom: zoom, aspect: aspect, onCropChange: setCrop, onZoomChange: setZoom, onCropComplete: onCropComplete }) }), _jsxs("div", { className: "flex justify-end mt-4", children: [_jsx("button", { type: "button", onClick: () => setShowCropper(false), className: "mr-2 px-4 py-2 bg-gray-300 rounded", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx("button", { type: "button", onClick: handleCropSave, className: "px-4 py-2 bg-green-500 text-white rounded", children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" })] })] }) })), _jsx("img", { src: localPreview, alt: "\u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440", className: "w-full h-full object-cover rounded-lg p-1" }), _jsx("button", { type: "button", onClick: handleRemoveClick, className: "absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 text-xs", children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" })] })) : (_jsx("img", { src: "/placeholderImage.png", alt: "\u041F\u043B\u0435\u0439\u0441\u0445\u043E\u043B\u0434\u0435\u0440", className: "object-contain w-full h-full p-8 mx-auto my-auto" })) }), _jsxs("div", { className: "mt-2", children: [_jsx("button", { type: "button", onClick: () => inputRef.current?.click(), className: "px-6 py-2 bg-gray-600 text-white rounded-lg", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u043E\u0442\u043E" }), _jsx("input", { type: "file", accept: "image/*", ref: inputRef, className: "hidden", onChange: handleInputChange })] }), internalError && _jsx("p", { className: "text-red-500 text-center mt-2", children: internalError }), error && errorMessage && _jsx("p", { className: "text-red-500 text-center mt-2", children: errorMessage }), showFullImage && localPreview && (_jsx(ModalFullImage, { imageSrc: localPreview, onClose: () => setShowFullImage(false) }))] }));
};
