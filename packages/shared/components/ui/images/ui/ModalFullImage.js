'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from 'lucide-react';
const ModalFullImage = ({ imageSrc, onClose }) => {
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75", children: _jsxs("div", { className: "relative", children: [_jsx("img", { src: imageSrc, alt: "\u041F\u043E\u043B\u043D\u043E\u0435 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u0435", className: "max-w-full max-h-screen" }), _jsx("button", { onClick: onClose, className: "absolute top-2 left-2 bg-white px-2 py-1 rounded shadow", style: {
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
                        backdropFilter: 'blur(5px)',
                        border: 'none',
                    }, children: _jsx(X, { size: 24 }) })] }) }));
};
export default ModalFullImage;
