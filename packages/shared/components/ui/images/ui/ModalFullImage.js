'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ModalFullImage = ({ imageSrc, onClose }) => {
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75", children: _jsxs("div", { className: "relative", children: [_jsx("img", { src: imageSrc, alt: "\u041F\u043E\u043B\u043D\u043E\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435", className: "max-w-full max-h-screen" }), _jsx("button", { onClick: onClose, className: "absolute top-2 left-2 bg-white px-2 py-1 rounded shadow", children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" })] }) }));
};
export default ModalFullImage;
